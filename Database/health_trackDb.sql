create database healthtrack;
use healthtrack;

create table users (
    user_id int primary key auto_increment,
    full_name varchar(100) not null,
    email varchar(100) unique not null,
    password varchar(255) not null,
    gender varchar(10),
    date_of_birth date,
    created_at timestamp default current_timestamp
);
create table health_records (
    record_id int primary key auto_increment,
    user_id int not null,
    record_date date not null,

    weight decimal(5,2),              -- in kg
    height decimal(5,2),              -- in cm
    systolic_bp int,                  -- upper bp
    diastolic_bp int,                 -- lower bp
    sugar_level decimal(5,2),         -- mg/dl
    water_intake decimal(4,2),        -- liters
    sleep_hours decimal(4,2),         -- hours
    exercise_minutes int,             -- minutes

    bmi decimal(5,2),                 -- calculated

    created_at timestamp default current_timestamp,

    foreign key (user_id) references users(user_id)
        on delete cascade
);
create table alerts (
    alert_id int primary key auto_increment,
    user_id int not null,
    record_id int,
    alert_message varchar(255),
    alert_type varchar(50),   -- high bp / high sugar / etc
    created_at timestamp default current_timestamp,

    foreign key (user_id) references users(user_id)
        on delete cascade,
    foreign key (record_id) references health_records(record_id)
        on delete cascade
);
create table goals (
    goal_id int primary key auto_increment,
    user_id int not null,
    goal_type varchar(50),   -- weight / sleep / water
    target_value decimal(5,2),
    start_date date,
    end_date date,

    foreign key (user_id) references users(user_id)
        on delete cascade
);




