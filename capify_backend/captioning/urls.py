from .import views
from django.urls import path
urlpatterns = [
    path('caption/',views.generate_caption,name='generate_caption'),
    path('api/caption/', views.generate_caption, name='api_generate_caption'),
    path('register/', views.RegisterAPIView.as_view(), name='register'),
    path('login/', views.LoginAPIView.as_view(), name='login'),
]