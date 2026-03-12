from django.contrib import admin
from unfold.admin import ModelAdmin
from unfold.decorators import display
from django.utils.html import format_html
from .models import Payment, StudentDonation, NonStudentDonation


@admin.register(Payment)
class PaymentAdmin(ModelAdmin):
    list_display = ('transaction_reference', 'amount', 'currency', 'display_status', 'created_at')
    list_filter = ('status', 'currency', 'created_at')
    search_fields = ('transaction_reference', 'amount')
    ordering = ('-created_at',)
    readonly_fields = ('transaction_reference', 'created_at')
    list_per_page = 25

    @display(description="Status", label={"Completed": "success", "Pending": "warning", "Failed": "danger"})
    def display_status(self, obj):
        return obj.status


@admin.register(StudentDonation)
class StudentDonationAdmin(ModelAdmin):
    list_display = ('student', 'fund_category', 'get_amount', 'display_payment_status', 'donated_at')
    list_filter = ('fund_category', 'donated_at', 'payment__status')
    search_fields = ('student__username', 'student__email', 'student__first_name', 'student__last_name', 'payment__transaction_reference')
    ordering = ('-donated_at',)
    autocomplete_fields = ['student', 'payment']
    readonly_fields = ('donated_at',)
    list_per_page = 25

    def get_amount(self, obj):
        return f"{obj.payment.amount} {obj.payment.currency}"
    get_amount.short_description = 'Amount'

    @display(description="Status", label={"Completed": "success", "Pending": "warning", "Failed": "danger"})
    def display_payment_status(self, obj):
        return obj.payment.status


@admin.register(NonStudentDonation)
class NonStudentDonationAdmin(ModelAdmin):
    list_display = ('get_full_name', 'email', 'fund_category', 'get_amount', 'display_payment_status', 'donated_at')
    list_filter = ('fund_category', 'donated_at', 'payment__status')
    search_fields = ('first_name', 'last_name', 'email', 'payment__transaction_reference')
    ordering = ('-donated_at',)
    autocomplete_fields = ['payment']
    readonly_fields = ('donated_at',)
    list_per_page = 25

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    get_full_name.short_description = 'Donor Name'

    def get_amount(self, obj):
        return f"{obj.payment.amount} {obj.payment.currency}"
    get_amount.short_description = 'Amount'

    @display(description="Status", label={"Completed": "success", "Pending": "warning", "Failed": "danger"})
    def display_payment_status(self, obj):
        return obj.payment.status
