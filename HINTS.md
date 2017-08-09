# Backend server
## Timesheet
User logs in or registers
Checks in and a form is shown to enter a break time
Also a calender of 2 views: monthly and weekly to show working time of the respective times.
Should we need to save each break times? Lets assume we don't have to and just save the time worked in a day in db.

## How should it work?

Listen for get requests and serve static angular files.
If post request is received, do database operations.

Database name: timesheet
Tables in timesheet db:

Users:
- Name
- email
- password
- userid(PK)

To save times, we have two approaches:
- A new table for each user
- Single table for all users

For 1: Table name - username
- Date(PK)
- Working hours

For 2: Table name - workinghrs
- userid (PK)
- Date
- Working hours

From the two, 1 is selected for reasons:
- As time goes on the rows in the tables goes on increasing, so it's better to go with 1 for quick response
- Date is Primary Key in 1, this ensures that no date is repeated
- select * from username where date=$date is better than select * from workinghrs where date=$date & userid=$userid

## Showing data

Show the data in monthly or weekly order.

## Login

Make login form also

