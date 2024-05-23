from django.contrib import admin
from . import models

# Register your models here.

admin.site.register(models.User)
admin.site.register(models.Blocking)
admin.site.register(models.Friendship)
