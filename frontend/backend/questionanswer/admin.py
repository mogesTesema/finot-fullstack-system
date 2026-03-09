from django.contrib import admin
from .models import Question, Answer

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('question', 'responder', 'display_name', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'created_at')
    search_fields = ('answer_body', 'display_name', 'responder__username', 'question__question_body')
    ordering = ('-created_at',)
    actions = ['approve_answers']
    autocomplete_fields = ['responder', 'question']
    
    def approve_answers(self, request, queryset):
        queryset.update(is_approved=True)
    approve_answers.short_description = "Approve selected answers"

class AnswerInline(admin.StackedInline):
    model = Answer
    extra = 0
    readonly_fields = ('created_at', 'is_approved')
    autocomplete_fields = ['responder']

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('display_name', 'category', 'is_approved', 'created_at', 'user', 'answer_count_display')
    list_filter = ('is_approved', 'category', 'created_at')
    search_fields = ('question_body', 'display_name', 'user__username')
    ordering = ('-created_at',)
    inlines = [AnswerInline]
    actions = ['approve_questions']
    autocomplete_fields = ['user']

    def answer_count_display(self, obj):
        return obj.answers.count()
    answer_count_display.short_description = 'Answers'

    def approve_questions(self, request, queryset):
        queryset.update(is_approved=True)
    approve_questions.short_description = "Approve selected questions"

