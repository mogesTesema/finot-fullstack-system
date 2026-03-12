from django.contrib import admin
from unfold.admin import ModelAdmin, StackedInline
from unfold.decorators import display
from .models import Question, Answer


class AnswerInline(StackedInline):
    model = Answer
    extra = 0
    readonly_fields = ('created_at', 'is_approved')
    autocomplete_fields = ['responder']


@admin.register(Answer)
class AnswerAdmin(ModelAdmin):
    list_display = ('question', 'responder', 'display_name', 'display_approved', 'created_at')
    list_filter = ('is_approved', 'created_at')
    search_fields = ('answer_body', 'display_name', 'responder__username', 'question__question_body')
    ordering = ('-created_at',)
    actions = ['approve_answers']
    autocomplete_fields = ['responder', 'question']
    list_per_page = 25

    @display(description="Approved", label={"Yes": "success", "No": "warning"})
    def display_approved(self, obj):
        return "Yes" if obj.is_approved else "No"

    @admin.action(description="Approve selected answers")
    def approve_answers(self, request, queryset):
        queryset.update(is_approved=True)


@admin.register(Question)
class QuestionAdmin(ModelAdmin):
    list_display = ('display_name', 'category', 'display_approved', 'created_at', 'user', 'answer_count_display')
    list_filter = ('is_approved', 'category', 'created_at')
    search_fields = ('question_body', 'display_name', 'user__username')
    ordering = ('-created_at',)
    inlines = [AnswerInline]
    actions = ['approve_questions']
    autocomplete_fields = ['user']
    list_per_page = 25

    def answer_count_display(self, obj):
        return obj.answers.count()
    answer_count_display.short_description = 'Answers'

    @display(description="Approved", label={"Yes": "success", "No": "warning"})
    def display_approved(self, obj):
        return "Yes" if obj.is_approved else "No"

    @admin.action(description="Approve selected questions")
    def approve_questions(self, request, queryset):
        queryset.update(is_approved=True)
