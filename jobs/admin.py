from django.contrib import admin
from .models import JobApplication
# Register your models here.
@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = (
        "company_name",
        "job_title",
        "location",
        "status",
        "application_date",
    )

    list_filter = ("status", "location")

    search_fields = ("company_name", "job_title")