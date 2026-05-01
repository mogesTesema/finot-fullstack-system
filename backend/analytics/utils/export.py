import csv
import json
import datetime
from django.http import HttpResponse

def calculate_target_batch(target_year, current_batch):
    """
    Calculates the 'entry year' of a cohort and returns a tuple:
    (calculated_entry_year, current_expected_batch_for_that_cohort)
    
    Logic:
    Current Entry Year = Current Academic Year - Current Batch + 1
    Historical Entry Year = Target Year - Historical Batch + 1
    
    For a given target_year and batch, we want the students who were in that 'batch'
    during that 'target_year'.
    
    Their entry year would be: target_year - batch + 1.
    Today, their expected batch would be: Current Year - Entry Year + 1.
    """
    current_year = datetime.datetime.now().year
    entry_year = int(target_year) - int(current_batch) + 1
    
    # What would their batch be TODAY?
    expected_current_batch = current_year - entry_year + 1
    
    return expected_current_batch

def generate_csv_response(queryset, fields, filename="export.csv"):
    response = HttpResponse(content_type='text/csv')
    # Adding BOM so Excel opens it with correct UTF-8 encoding automatically
    response.write(b'\xef\xbb\xbf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'

    writer = csv.writer(response)
    
    # Resolve headers
    headers = []
    for field in fields:
        if field == 'first_name': headers.append('First Name')
        elif field == 'last_name': headers.append('Last Name')
        elif field == 'username': headers.append('Username')
        elif field == 'email': headers.append('Email')
        elif field == 'gender': headers.append('Gender')
        else: headers.append(field.replace('_', ' ').title())
        
    writer.writerow(headers)

    for student in queryset:
        row = []
        for field in fields:
            if field in ['first_name', 'last_name', 'username', 'email', 'gender']:
                row.append(getattr(student.user, field, ''))
            else:
                row.append(getattr(student, field, ''))
        writer.writerow(row)

    return response

def generate_json_response(queryset, fields, filename="export.json"):
    data = []
    for student in queryset:
        row = {}
        for field in fields:
            if field in ['first_name', 'last_name', 'username', 'email', 'gender']:
                row[field] = getattr(student.user, field, '')
            else:
                val = getattr(student, field, '')
                # Ensure JSON serialization for dates/UUIDs
                if isinstance(val, (datetime.date, datetime.datetime)):
                    val = val.isoformat()
                else:
                    val = str(val)
                row[field] = val
        data.append(row)

    response = HttpResponse(
        json.dumps(data, indent=4),
        content_type='application/json'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response
