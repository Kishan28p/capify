from django.db import models

# Create your models here.
class RegistrationModel(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField()

    def __str__(self):
        return self.first_name + ' ' + self.last_name