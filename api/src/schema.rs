use diesel::table;
use diesel::joinable;
use diesel::allow_tables_to_appear_in_same_query;

table! {
    users (id) {
        id -> Text,
        username -> Text,
        email -> Text,
        password -> Nullable<Text>,
        email_verified -> Bool,
        image -> Nullable<Text>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

table! {
    folders (id) {
        id -> Int4,
        name -> Text,
        user_id -> Text,
    }
}

table! {
    emails (id) {
        id -> Int4,
        subject -> Text,
        body -> Text,
        from -> Text,
        to -> Text,
        cc -> Nullable<Text>,
        bcc -> Nullable<Text>,
        sent_at -> Timestamp,
        folder_id -> Int4,
        user_id -> Text,
    }
}

joinable!(folders -> users (user_id));
joinable!(emails -> folders (folder_id));
joinable!(emails -> users (user_id));

allow_tables_to_appear_in_same_query!(users, folders, emails);