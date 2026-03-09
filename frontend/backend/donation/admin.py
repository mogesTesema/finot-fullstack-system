from django.contrib import admin
from .models import Payment, StudentDonation, NonStudentDonation
from django.utils.html import format_html

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('transaction_reference', 'amount', 'currency', 'status_badge', 'created_at')
    list_filter = ('status', 'currency', 'created_at')
    search_fields = ('transaction_reference', 'amount')
    ordering = ('-created_at',)
    readonly_fields = ('transaction_reference', 'created_at')
    
    def status_badge(self, obj):
        colors = {
            'COMPLETED': 'green',
            'PENDING': 'orange',
            'FAILED': 'red',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: white; background-color: {}; padding: 5px 10px; border-radius: 5px;">{}</span>',
            color,
            obj.status,
        )
    status_badge.short_description = 'Status'

@admin.register(StudentDonation)
class StudentDonationAdmin(admin.ModelAdmin):
    list_display = ('student', 'fund_category', 'get_amount', 'get_payment_status', 'donated_at')
    list_filter = ('fund_category', 'donated_at', 'payment__status')
    search_fields = ('student__username', 'student__email', 'student__first_name', 'student__last_name', 'payment__transaction_reference')
    ordering = ('-donated_at',)
    autocomplete_fields = ['student', 'payment']
    readonly_fields = ('donated_at',)

    def get_amount(self, obj):
        return f"{obj.payment.amount} {obj.payment.currency}"
    get_amount.short_description = 'Amount'

    def get_payment_status(self, obj):
        return obj.payment.status
    get_payment_status.short_description = 'Status'

@admin.register(NonStudentDonation)
class NonStudentDonationAdmin(admin.ModelAdmin):
    list_display = ('get_full_name', 'email', 'fund_category', 'get_amount', 'get_payment_status', 'donated_at')
    list_filter = ('fund_category', 'donated_at', 'payment__status')
    search_fields = ('first_name', 'last_name', 'email', 'payment__transaction_reference')
    ordering = ('-donated_at',)
    autocomplete_fields = ['payment']
    readonly_fields = ('donated_at',)

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    get_full_name.short_description = 'Donor Name'

    def get_amount(self, obj):
        return f"{obj.payment.amount} {obj.payment.currency}"
    get_amount.short_description = 'Amount'

    def get_payment_status(self, obj):
        return obj.payment.status
    get_payment_status.short_description = 'Status'

    get_amount.short_description = 'Amount'


