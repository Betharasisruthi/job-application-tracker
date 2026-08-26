from rest_framework.routers import DefaultRouter
from .views import JobApplicationViewSet


router = DefaultRouter()
router.register("jobs", JobApplicationViewSet, basename="job")

urlpatterns = router.urls