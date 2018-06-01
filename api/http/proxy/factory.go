package proxy

import (
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/chainid-io/dashboard"
	"github.com/chainid-io/dashboard/crypto"
)

const azureAPIBaseURL = "https://management.azure.com"

// proxyFactory is a factory to create reverse proxies to Docker endpoints
type proxyFactory struct {
	ResourceControlService chainid.ResourceControlService
	TeamMembershipService  chainid.TeamMembershipService
	SettingsService        chainid.SettingsService
	RegistryService        chainid.RegistryService
	DockerHubService       chainid.DockerHubService
	SignatureService       chainid.DigitalSignatureService
}

func (factory *proxyFactory) newHTTPProxy(u *url.URL) http.Handler {
	u.Scheme = "http"
	return newSingleHostReverseProxyWithHostHeader(u)
}

func newAzureProxy(credentials *chainid.AzureCredentials) (http.Handler, error) {
	url, err := url.Parse(azureAPIBaseURL)
	if err != nil {
		return nil, err
	}

	proxy := newSingleHostReverseProxyWithHostHeader(url)
	proxy.Transport = NewAzureTransport(credentials)

	return proxy, nil
}

func (factory *proxyFactory) newDockerHTTPSProxy(u *url.URL, tlsConfig *chainid.TLSConfiguration, enableSignature bool) (http.Handler, error) {
	u.Scheme = "https"

	proxy := factory.createDockerReverseProxy(u, enableSignature)
	config, err := crypto.CreateTLSConfigurationFromDisk(tlsConfig.TLSCACertPath, tlsConfig.TLSCertPath, tlsConfig.TLSKeyPath, tlsConfig.TLSSkipVerify)
	if err != nil {
		return nil, err
	}

	proxy.Transport.(*proxyTransport).dockerTransport.TLSClientConfig = config
	return proxy, nil
}

func (factory *proxyFactory) newDockerHTTPProxy(u *url.URL, enableSignature bool) http.Handler {
	u.Scheme = "http"
	return factory.createDockerReverseProxy(u, enableSignature)
}

func (factory *proxyFactory) newDockerSocketProxy(path string) http.Handler {
	proxy := &socketProxy{}
	transport := &proxyTransport{
		enableSignature:        false,
		ResourceControlService: factory.ResourceControlService,
		TeamMembershipService:  factory.TeamMembershipService,
		SettingsService:        factory.SettingsService,
		RegistryService:        factory.RegistryService,
		DockerHubService:       factory.DockerHubService,
		dockerTransport:        newSocketTransport(path),
	}
	proxy.Transport = transport
	return proxy
}

func (factory *proxyFactory) createDockerReverseProxy(u *url.URL, enableSignature bool) *httputil.ReverseProxy {
	proxy := newSingleHostReverseProxyWithHostHeader(u)
	transport := &proxyTransport{
		enableSignature:        enableSignature,
		ResourceControlService: factory.ResourceControlService,
		TeamMembershipService:  factory.TeamMembershipService,
		SettingsService:        factory.SettingsService,
		RegistryService:        factory.RegistryService,
		DockerHubService:       factory.DockerHubService,
		dockerTransport:        &http.Transport{},
	}

	if enableSignature {
		transport.SignatureService = factory.SignatureService
	}

	proxy.Transport = transport
	return proxy
}

func newSocketTransport(socketPath string) *http.Transport {
	return &http.Transport{
		Dial: func(proto, addr string) (conn net.Conn, err error) {
			return net.Dial("unix", socketPath)
		},
	}
}