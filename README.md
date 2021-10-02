
To Do Tasks
===========


### Introduction
To do tasks is normal to do lists with extra feature of tasks getting refreshed everyday i.e even after you tick off a task it gets unticked next day. The main advantage is it helps you keep track of the daily mandatory tasks and keep you aware of what is completed each day. This comes under daily tasks section. There is one more section called general tasks section which is similar to normal to do checklist.


---

#### Features
- Application is a role based application. Admins can manage the users and grant admin access. Admins can see the feedback given by the users as well.
- Two sections are present in To Do tasks
    - Daily Tasks (gets refreshed everyday)
    - General Tasks
- Tasks can be checked/ticked and unchecked/unticked.
- We can delete the tasks from ticked and unticked as well.
    - Note: Tasks under daily tasks should be deleted if you don't want a task to be refreshed again next day.




---

### Technical Features
- Splash screen
- View password while typing.
- Login as it requires to monitor the items based on the user.
- Refresh Token and access token stored as http only cookies
- Page to enter the items for the planner initially. From next time we can use api store the items.
- Connect to Django application which stores item planners in the database.
- Once development is done we can deploy to cloud.

---

#### Repo links
- List of Tasks (todo-lists)
    - > https://github.com/sngrmvj/todo-lists
- Authentication Server (todo-auth)
    - > https://github.com/sngrmvj/todo-auth
