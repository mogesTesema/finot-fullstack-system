from django.db import connection

def check_schema():
    with connection.cursor() as cursor:
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'course_%';")
        tables = [row[0] for row in cursor.fetchall()]
        print("TABLES:")
        for t in tables:
            print(f" - {t}")
            
        print("\nFOREIGN KEYS ON course_courseenrollment:")
        cursor.execute("""
            SELECT kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name 
            FROM information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema 
            JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema 
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='course_courseenrollment';
        """)
        for row in cursor.fetchall():
            print(f"   {row[0]} -> {row[1]}({row[2]})")

check_schema()
