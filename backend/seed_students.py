import os
import django
import random

# Setup Django environment so the script can be run standalone
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User, Role
from student.models import StudentProfile

def seed_students():
    print("Starting to seed students...")

    # Ensure the Student role exists
    student_role, _ = Role.objects.get_or_create(
        name=Role.STUDENT,
        defaults={'description': 'System Student Role'}
    )

    departments = ["Computer Science", "Software Engineering", "Information Systems", "Electrical Engineering", "Mechanical Engineering"]
    blocks = [5, 6, 7, 8, 9, 10]
    sections = [1, 2, 3, 4, 5]
    churches = ["Kidist Maryam", "Medhane Alem", "Kidist Arsema", "St. George", "St. Gabriel"]

    total_created = 0

    # Batches 1 to 5
    for batch in range(1, 6):
        # 5 males and 5 females per batch
        for gender, gender_prefix in [(User.GENDER_MALE, "m"), (User.GENDER_FEMALE, "f")]:
            for i in range(1, 6):
                username = f"stu_b{batch}_{gender_prefix}{i}"
                email = f"{username}@test.finot.edu"

                # Skip if student already exists
                if User.objects.filter(username=username).exists():
                    print(f"Skipping {username} (already exists)")
                    continue

                # Create the user
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password="password123",  # default testing password
                    first_name=f"First{batch}{gender_prefix.upper()}",
                    last_name=f"Last{i}",
                    gender=gender,
                )
                
                # Assign role
                user.roles.add(student_role)

                # Update the auto-created student profile
                profile = user.student_profile
                profile.batch_year = batch
                profile.department = random.choice(departments)
                profile.dorm_block = random.choice(blocks)
                profile.dorm_room = random.randint(101, 499)
                profile.section = random.choice(sections)
                profile.telegram_username = f"@{username}_bot"
                profile.personal_phone = f"+2519{random.randint(10000000, 99999999)}"
                profile.emergency_name = f"Guardian of {user.first_name}"
                profile.emergency_phone = f"+2519{random.randint(10000000, 99999999)}"
                profile.emergency_relation = random.choice(["Father", "Mother", "Uncle", "Aunt"])
                profile.home_address = "Addis Ababa, Bole Subcity"
                profile.previous_church = random.choice(churches)
                profile.activity_serving = random.choice(["Sunday School", "Choir", "None"])
                profile.confession_father = f"Aba {random.choice(['Gebre', 'Tesfa', 'Kifle', 'Samuel'])}"
                profile.status = StudentProfile.IN_CAMPUS
                profile.save()
                
                total_created += 1

    print(f"✅ Successfully seeded {total_created} test students.")
    print("Test credentials format -> Username: stu_b[batch]_[m/f][1-5] | Password: password123")
    print("Example: Username: stu_b1_m1 | Password: password123")

if __name__ == '__main__':
    seed_students()
