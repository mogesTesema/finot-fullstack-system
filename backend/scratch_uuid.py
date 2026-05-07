import uuid
u1 = uuid.uuid4()
u2 = str(u1)

# simulate serializer parsing
parsed_u2 = uuid.UUID(u2)

# simulate values_list string conversion
s1 = str(u1)
s2 = str(parsed_u2)
print("Match?", s1 == s2)
