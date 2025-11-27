-- Create a function to get or create a conversation between two users
create or replace function public.get_or_create_conversation(other_user_id uuid)
returns uuid
language plpgsql
security definer
as $$
declare
    conversation_id uuid;
    current_user_id uuid;
begin
    current_user_id := auth.uid();

    -- Check if a conversation already exists between these two users
    select c.id into conversation_id
    from public.conversations c
    join public.conversation_participants cp1 on c.id = cp1.conversation_id
    join public.conversation_participants cp2 on c.id = cp2.conversation_id
    where cp1.user_id = current_user_id
    and cp2.user_id = other_user_id
    limit 1;

    -- If it exists, return it
    if conversation_id is not null then
        return conversation_id;
    end if;

    -- If not, create a new conversation
    insert into public.conversations default values
    returning id into conversation_id;

    -- Add participants
    insert into public.conversation_participants (conversation_id, user_id)
    values
        (conversation_id, current_user_id),
        (conversation_id, other_user_id);

    return conversation_id;
end;
$$;
