"""
Data migration: Copy existing course.CourseMaterial records into resources.Material.

Each old CourseMaterial was tied to a SemesterCourse. We migrate them to point
to the parent Course (the static curriculum), setting material_type to COURSE.
"""
from django.db import migrations


def migrate_course_materials_forward(apps, schema_editor):
    OldCourseMaterial = apps.get_model('course', 'CourseMaterial')
    NewMaterial = apps.get_model('resources', 'Material')

    old_materials = OldCourseMaterial.objects.select_related(
        'semester_course', 'semester_course__course'
    ).all()

    new_records = []
    for old in old_materials:
        new_records.append(NewMaterial(
            title=old.title,
            file=old.file,
            url=old.url,
            material_type='COURSE',
            course=old.semester_course.course,
            service_group=None,
            uploaded_by=None,
            created_at=old.uploaded_at,
        ))

    if new_records:
        NewMaterial.objects.bulk_create(new_records)


def migrate_course_materials_reverse(apps, schema_editor):
    """
    Reverse migration is a no-op. We don't delete from the new table
    because we cannot deterministically map back to SemesterCourse.
    """
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('resources', '0001_initial'),
        ('course', '0006_remove_semestercourse_teachers_and_more'),
    ]

    operations = [
        migrations.RunPython(
            migrate_course_materials_forward,
            migrate_course_materials_reverse,
        ),
    ]
