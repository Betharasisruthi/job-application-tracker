from rest_framework import viewsets
from .models import JobApplication
from .serializers import JobApplicationSerializer


class JobApplicationViewSet(viewsets.ModelViewSet):
    queryset = JobApplication.objects.all().order_by("-application_date")
    serializer_class = JobApplicationSerializer