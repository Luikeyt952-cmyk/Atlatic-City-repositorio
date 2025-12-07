# config/urls.py (o como se llame tu proyecto)
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('crm.urls')),  # <-- aquí montas tus endpoints
]
