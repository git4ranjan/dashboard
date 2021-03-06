function SecretViewModel(data) {
  this.Id = data.ID;
  this.CreatedAt = data.CreatedAt;
  this.UpdatedAt = data.UpdatedAt;
  this.Version = data.Version.Index;
  this.Name = data.Spec.Name;
  this.Labels = data.Spec.Labels;

  if (data.Chain Platform) {
    if (data.Chain Platform.ResourceControl) {
      this.ResourceControl = new ResourceControlViewModel(data.Chain Platform.ResourceControl);
    }
  }
}
