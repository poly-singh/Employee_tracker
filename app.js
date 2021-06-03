const mysql = require("mysql");
const inquirer = require("inquirer");
const consoleTable = require("console.table");
const promisemysql = require("promise-mysql");

const connectionProperties = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Database_123",
    database: "employees_DB"
}

const connection = mysql.createConnection(connectionProperties);
 
// Establishing Connection to database
connection.connect((err) => {
    if (err) throw err;

    // Start main menu function

    console.log("\n WELCOME TO EMPLOYEE TRACKER \n");
    startPrompt();
});

// startPrompt
function startPrompt(){

    // Prompts to choose options
    inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "MAIN MENU",
      choices: [
        "View all employees",
        "View all employees by role",
        "View all employees by department",
        "View all employees by manager",
        "Add employee",
        "Add role",
        "Add department",
        "Update employee role",
        "Update employee manager",
        "Delete employee",
        "Delete role",
        "Delete department",
        "View department budgets"
      ]
    })
    .then((answer) => {

        // Switch case for different options
        switch (answer.action) {
            case "View all employees":
                viewEmployees();
                break;

            case "View all employees by department":
                viewEmpByDept();
                break;

            case "View all employees by role":
                viewEmpByRole();
                break;

            case "Add employee":
                addEmployee();
                break;

            case "Add department":
                addDepartment();
                break;
            case "Add role":
                addRole();
                break;
            case "Update employee role":
                updateEmpRole();
                break;
            case "Update employee manager":
                updateEmpManager();
                break;
            case "View all employees by manager":
                viewEmpByManager();
                break;
            case "Delete employee":
                deleteEmployee();
                break;
            case "View department budgets":
                viewBudget();
                break;
            case "Delete role":
                deleteRole();
                break;
            case "Delete department":
                deleteDept();
                break;
        }
    });
}

// to display all employees 
function viewEmployees(){

    // Query 
    let query = "SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, concat(m.first_name, ' ' ,  m.last_name) AS manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id ORDER BY ID ASC";

    
    connection.query(query, function(err, res) {
        if(err) return err;
        console.log("\n");

        // Display results 
        console.table(res);

        //Back to startPrompt
        startPrompt();
    });
}

// display employees by department
function viewEmpByDept(){
    let deptArray = [];

    //new connection using promise-sql
    promisemysql.createConnection(connectionProperties
    ).then((conn) => {

        // Query for department names
        return conn.query('SELECT name FROM department');
    }).then(function(value){

        // adding the values to Array
        deptQuery = value;
        for (i=0; i < value.length; i++){
            deptArray.push(value[i].name);
            
        }
    }).then(() => {

        // Prompt to select department
        inquirer.prompt({
            name: "department",
            type: "list",
            message: "Which department would you like to search?",
            choices: deptArray
        })    
        .then((answer) => {

            // Query all employees with chosen department
            const query = `SELECT e.id AS ID, e.first_name AS 'First Name', e.last_name AS 'Last Name', role.title AS Title, department.name AS Department, role.salary AS Salary, concat(m.first_name, ' ' ,  m.last_name) AS Manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE department.name = '${answer.department}' ORDER BY ID ASC`;
            connection.query(query, (err, res) => {
                if(err) return err;
                
                // Show results in console.table
                console.log("\n");
                console.table(res);

                // Back to main menu
                startPrompt();
            });
        });
    });
}

// view employees by role
function viewEmpByRole(){

    // array to store roles
    let roleArray = [];

    // connection using promise-sql
    promisemysql.createConnection(connectionProperties)
    .then((conn) => {

        // Query for all roles
        return conn.query('SELECT title FROM role');
    }).then(function(roles){

        // add all roles within the roleArry
        for (i=0; i < roles.length; i++){
            roleArray.push(roles[i].title);
        }
    }).then(() => {

        // Prompt user to select a role
        inquirer.prompt({
            name: "role",
            type: "list",
            message: "Which role would you like to search?",
            choices: roleArray
        })    
        .then((answer) => {

            // Query all employees by role selected by user
            const query = `SELECT e.id AS ID, e.first_name AS 'First Name', e.last_name AS 'Last Name', role.title AS Title, department.name AS Department, role.salary AS Salary, concat(m.first_name, ' ' ,  m.last_name) AS Manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE role.title = '${answer.role}' ORDER BY ID ASC`;
            connection.query(query, (err, res) => {
                if(err) return err;

                // displaying results 
                console.log("\n");
                console.table(res);
                startPrompt();
            });
        });
    });
}

// Add employee
function addEmployee(){

    // Create two global array to hold 
    let roleArray = [];
    let managerArray = [];

    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties
    ).then((conn) => {

        // Query  all roles and all manager
        return Promise.all([
            conn.query('SELECT id, title FROM role ORDER BY title ASC'), 
            conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee ASC")
        ]);
    }).then(([roles, managers]) => {

        // add all roles in array
        for (i=0; i < roles.length; i++){
            roleArray.push(roles[i].title);
        }

        // add all managers in array
        for (i=0; i < managers.length; i++){
            managerArray.push(managers[i].Employee);
        }

        return Promise.all([roles, managers]);
    }).then(([roles, managers]) => {

        // option for no manager
        managerArray.unshift('--');

        inquirer.prompt([
            {
                // Prompt user of their first name
                name: "firstName",
                type: "input",
                message: "First name: ",
                // Validate field is not blank
                validate: function(input){
                    if (input === ""){
                        console.log("**FIELD REQUIRED**");
                        return false;
                    }
                    else{
                        return true;
                    }
                }
            },
            {
                // Prompt user of their last name
                name: "lastName",
                type: "input",
                message: "Lastname name: ",
                // Validate field is not blank
                validate: function(input){
                    if (input === ""){
                        console.log("**FIELD REQUIRED**");
                        return false;
                    }
                    else{
                        return true;
                    }
                }
            },
            {
                // Prompt user of their role
                name: "role",
                type: "list",
                message: "What is their role?",
                choices: roleArray
            },{
                // Prompt user for manager
                name: "manager",
                type: "list",
                message: "Who is their manager?",
                choices: managerArray
            }]).then((answer) => {

                // Set variable for IDs
                let roleID;
                let managerID = null;

                // Get ID of selected role
                for (i=0; i < roles.length; i++){
                    if (answer.role == roles[i].title){
                        roleID = roles[i].id;
                    }
                }

                // get ID of manager selected
                for (i=0; i < managers.length; i++){
                    if (answer.manager == managers[i].Employee){
                        managerID = managers[i].id;
                    }
                }

                // Add employee
                connection.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
                VALUES ("${answer.firstName}", "${answer.lastName}", ${roleID}, ${managerID})`, (err, res) => {
                    if(err) return err;

                    // Confirm employee has been added
                    console.log(`\n EMPLOYEE ${answer.firstName} ${answer.lastName} ADDED...\n `);
                    startPrompt();
                });
            });
    });
}

// Add Role
function addRole(){

    // array of departments
    let departmentArray = [];

    // connection using promise-sql
    promisemysql.createConnection(connectionProperties)
    .then((conn) => {

        // Query all departments
        return conn.query('SELECT id, name FROM department ORDER BY name ASC');

    }).then((departments) => {
        
        // Place all departments in array
        for (i=0; i < departments.length; i++){
            departmentArray.push(departments[i].name);
        }

        return departments;
    }).then((departments) => {
        
        inquirer.prompt([
            {
                // Prompt user role title
                name: "roleTitle",
                type: "input",
                message: "Role title: "
            },
            {
                // Prompt user for salary
                name: "salary",
                type: "number",
                message: "Salary: "
            },
            {   
                // Prompt user to select department role is under
                name: "dept",
                type: "list",
                message: "Department: ",
                choices: departmentArray
            }]).then((answer) => {

                
                let deptID;

                // get id of department selected
                for (i=0; i < departments.length; i++){
                    if (answer.dept == departments[i].name){
                        deptID = departments[i].id;
                    }
                }

                // Added role 
                connection.query(`INSERT INTO role (title, salary, department_id)
                VALUES ("${answer.roleTitle}", ${answer.salary}, ${deptID})`, (err, res) => {
                    if(err) return err;
                    console.log(`\n ROLE ${answer.roleTitle} ADDED...\n`);
                    startPrompt();
                });

            });

    });
    
}

// Add Department
function addDepartment(){

    inquirer.prompt({

            // Prompt user to add department name
            name: "deptName",
            type: "input",
            message: "Department Name: "
        }).then((answer) => {
                
            // add department to the table
            connection.query(`INSERT INTO department (name)VALUES ("${answer.deptName}");`, (err, res) => {
                if(err) return err;
                console.log("\n DEPARTMENT ADDED...\n ");
                startPrompt();
            });

        });
}

// Update Employee Role
function updateEmpRole(){

    // create employee and role array
    let employeeArray = [];
    let roleArray = [];

    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties
    ).then((conn) => {
        return Promise.all([

            // query all roles and employee
            conn.query('SELECT id, title FROM role ORDER BY title ASC'), 
            conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee ASC")
        ]);
    }).then(([roles, employees]) => {

        // place all roles in array
        for (i=0; i < roles.length; i++){
            roleArray.push(roles[i].title);
        }

        // place all empoyees in array
        for (i=0; i < employees.length; i++){
            employeeArray.push(employees[i].Employee);
            //console.log(value[i].name);
        }

        return Promise.all([roles, employees]);
    }).then(([roles, employees]) => {

        inquirer.prompt([
            {
                // prompt user to select employee
                name: "employee",
                type: "list",
                message: "Who would you like to edit?",
                choices: employeeArray
            }, {
                // Select role to update employee
                name: "role",
                type: "list",
                message: "What is their new role?",
                choices: roleArray
            },]).then((answer) => {

                let roleID;
                let employeeID;

                /// get ID of role selected
                for (i=0; i < roles.length; i++){
                    if (answer.role == roles[i].title){
                        roleID = roles[i].id;
                    }
                }

                // get ID of employee selected
                for (i=0; i < employees.length; i++){
                    if (answer.employee == employees[i].Employee){
                        employeeID = employees[i].id;
                    }
                }
                
                // update employee with new role
                connection.query(`UPDATE employee SET role_id = ${roleID} WHERE id = ${employeeID}`, (err, res) => {
                    if(err) return err;

                    // confirm update employee
                    console.log(`\n ${answer.employee} ROLE UPDATED TO ${answer.role}...\n `);

                    // back to main menu
                    startPrompt();
                });
            });
    });
    
}

// Update employee manager
function updateEmpManager(){

    // array for employees
    let employeeArray = [];

    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties
    ).then((conn) => {

        // query all employees
        return conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee ASC");
    }).then((employees) => {

        // place employees in array
        for (i=0; i < employees.length; i++){
            employeeArray.push(employees[i].Employee);
        }

        return employees;
    }).then((employees) => {

        inquirer.prompt([
            {
                // prompt user to selected employee
                name: "employee",
                type: "list",
                message: "Who would you like to edit?",
                choices: employeeArray
            }, {
                // prompt user to select new manager
                name: "manager",
                type: "list",
                message: "Who is their new Manager?",
                choices: employeeArray
            },]).then((answer) => {

                let employeeID;
                let managerID;

                // get ID of selected manager
                for (i=0; i < employees.length; i++){
                    if (answer.manager == employees[i].Employee){
                        managerID = employees[i].id;
                    }
                }

                // get ID of selected employee
                for (i=0; i < employees.length; i++){
                    if (answer.employee == employees[i].Employee){
                        employeeID = employees[i].id;
                    }
                }

                // update employee with manager ID
                connection.query(`UPDATE employee SET manager_id = ${managerID} WHERE id = ${employeeID}`, (err, res) => {
                    if(err) return err;

                    // confirm update employee
                    console.log(`\n ${answer.employee} MANAGER UPDATED TO ${answer.manager}...\n`);

                    
                    startPrompt();
                });
            });
    });
}

// View all employees by manager
function viewEmpByManager(){

    // set manager array
    let managerArray = [];

    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties)
    .then((conn) => {

        // Query all employees
        return conn.query("SELECT DISTINCT m.id, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e Inner JOIN employee m ON e.manager_id = m.id");

    }).then(function(managers){

        // place all employees in array
        for (i=0; i < managers.length; i++){
            managerArray.push(managers[i].manager);
        }

        return managers;
    }).then((managers) => {

        inquirer.prompt({

            // Prompt user of manager
            name: "manager",
            type: "list",
            message: "Which manager would you like to search?",
            choices: managerArray
        })    
        .then((answer) => {

            let managerID;

            // get ID of manager selected
            for (i=0; i < managers.length; i++){
                if (answer.manager == managers[i].manager){
                    managerID = managers[i].id;
                }
            }

            // query all employees by selected manager
            const query = `SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, concat(m.first_name, ' ' ,  m.last_name) AS manager
            FROM employee e
            LEFT JOIN employee m ON e.manager_id = m.id
            INNER JOIN role ON e.role_id = role.id
            INNER JOIN department ON role.department_id = department.id
            WHERE e.manager_id = ${managerID};`;
    
            connection.query(query, (err, res) => {
                if(err) return err;
                
                // display results with console.table
                console.log("\n");
                console.table(res);

                // back to main menu
                startPrompt();
            });
        });
    });
}

// Delete employee
function deleteEmployee(){

    // Create global employee array
    let employeeArray = [];

    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties
    ).then((conn) => {

        // Query all employees
        return  conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS employee FROM employee ORDER BY Employee ASC");
    }).then((employees) => {

        // Place all employees in array
        for (i=0; i < employees.length; i++){
            employeeArray.push(employees[i].employee);
        }

        inquirer.prompt([
            {
                // prompt user of all employees
                name: "employee",
                type: "list",
                message: "Who would you like to delete?",
                choices: employeeArray
            }, {
                // confirm delete of employee
                name: "yesNo",
                type: "list",
                message: "Confirm deletion",
                choices: ["NO", "YES"]
            }]).then((answer) => {

                if(answer.yesNo == "YES"){
                    let employeeID;

                    // if confirmed, get ID of employee selected
                    for (i=0; i < employees.length; i++){
                        if (answer.employee == employees[i].employee){
                            employeeID = employees[i].id;
                        }
                    }
                    
                    // deleted selected employee
                    connection.query(`DELETE FROM employee WHERE id=${employeeID};`, (err, res) => {
                        if(err) return err;

                        // confirm deleted employee
                        console.log(`\n EMPLOYEE '${answer.employee}' DELETED...\n `);
                        
                        // back to main menu
                        startPrompt();
                    });
                } 
                else {
                    
                    // if not confirmed, go back to main menu
                    console.log(`\n EMPLOYEE '${answer.employee}' NOT DELETED...\n `);

                    // back to main menu
                    startPrompt();
                }
                
            });
    });
}

// Delete Role
function deleteRole(){

    // Create role array
    let roleArray = [];

    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties
    ).then((conn) => {

        // query all roles
        return conn.query("SELECT id, title FROM role");
    }).then((roles) => {    

        // add all roles to array
        for (i=0; i < roles.length; i++){
            roleArray.push(roles[i].title);
        }

        inquirer.prompt([{
            // confirm to continue to select role to delete
            name: "continueDelete",
            type: "list",
            message: "*** WARNING *** Deleting role will delete all employees associated with the role. Do you want to continue?",
            choices: ["NO", "YES"]
        }]).then((answer) => {

            // if not, go to main menu
            if (answer.continueDelete === "NO") {
                startPrompt();
            }

        }).then(() => {

            inquirer.prompt([{
                // prompt user of of roles
                name: "role",
                type: "list",
                message: "Which role would you like to delete?",
                choices: roleArray
            }, {
                // confirm to delete role by typing role exactly
                name: "confirmDelete",
                type: "Input",
                message: "Type the role title EXACTLY to confirm deletion of the role"

            }]).then((answer) => {

                if(answer.confirmDelete === answer.role){

                    // get role id of of selected role
                    let roleID;
                    for (i=0; i < roles.length; i++){
                        if (answer.role == roles[i].title){
                            roleID = roles[i].id;
                        }
                    }
                    
                    // delete role
                    connection.query(`DELETE FROM role WHERE id=${roleID};`, (err, res) => {
                        if(err) return err;

                        // confirm role has been added 
                        console.log(`\n ROLE '${answer.role}' DELETED...\n `);

                        //back to main menu
                        startPrompt();
                    });
                } 
                else {

                    // if not confirmed, do not delete
                    console.log(`\n ROLE '${answer.role}' NOT DELETED...\n `);

                    //back to main menu
                    startPrompt();
                }
                
            });
        })
    });
}

// Delete Department
function deleteDept(){

    // department array
    let deptArray = [];

    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties
    ).then((conn) => {

        // query all departments
        return conn.query("SELECT id, name FROM department");
    }).then((depts) => {

        // add all departments to array
        for (i=0; i < depts.length; i++){
            deptArray.push(depts[i].name);
        }

        inquirer.prompt([{

            // confirm to continue to select department to delete
            name: "continueDelete",
            type: "list",
            message: "*** WARNING *** Deleting a department will delete all roles and employees associated with the department. Do you want to continue?",
            choices: ["NO", "YES"]
        }]).then((answer) => {

            // go back to main menu
            if (answer.continueDelete === "NO") {
                startPrompt();
            }

        }).then(() => {

            inquirer.prompt([{

                // prompt user to select department
                name: "dept",
                type: "list",
                message: "Which department would you like to delete?",
                choices: deptArray
            }, {

                // confirm with user to delete
                name: "confirmDelete",
                type: "Input",
                message: "Type the department name EXACTLY to confirm deletion of the department: "

            }]).then((answer) => {

                if(answer.confirmDelete === answer.dept){

                    // if confirmed, get department id
                    let deptID;
                    for (i=0; i < depts.length; i++){
                        if (answer.dept == depts[i].name){
                            deptID = depts[i].id;
                        }
                    }
                    
                    // delete department
                    connection.query(`DELETE FROM department WHERE id=${deptID};`, (err, res) => {
                        if(err) return err;

                        // confirm department has been deleted
                        console.log(`\n DEPARTMENT '${answer.dept}' DELETED...\n `);

                        // back to main menu
                        startPrompt();
                    });
                } 
                else {

                    // do not delete department if not confirmed and go back to main menu
                    console.log(`\n DEPARTMENT '${answer.dept}' NOT DELETED...\n `);

                    //back to main menu
                    startPrompt();
                }
                
            });
        })
    });
}

// View Department Budget
function viewBudget(){

    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties)
    .then((conn) => {
        return  Promise.all([

            // query all departments and salaries
            conn.query("SELECT department.name AS department, role.salary FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id ORDER BY department ASC"),
            conn.query('SELECT name FROM department ORDER BY name ASC')
        ]);
    }).then(([deptSalaries, departments]) => {
        
        let deptBudgetArray =[];
        let department;

        for (d=0; d < departments.length; d++){
            let departmentBudget = 0;

            // add all salaries together
            for (i=0; i < deptSalaries.length; i++){
                if (departments[d].name == deptSalaries[i].department){
                    departmentBudget += deptSalaries[i].salary;
                }
            }

            // create new property with budgets
            department = {
                Department: departments[d].name,
                Budget: departmentBudget
            }

            // add to array
            deptBudgetArray.push(department);
        }
        console.log("\n");

        // display departments budgets using console.table
        console.table(deptBudgetArray);

        // back to main menu
        startPrompt();
    });
}
