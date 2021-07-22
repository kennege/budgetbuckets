<?php
// Initialize the session
session_start();
 
// Check if the user is already logged in, if yes then redirect him to welcome page
if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true){
    echo "LOGIN SUCCESS";
    header("location: ../php/welcome.php");
    exit;
}
 
// Include config file
require_once "../php/config.php";

// Define variables and initialize with empty values
$name = $password = "";
$name_err = $password_err = $login_err = "";
 
// Processing form data when form is submitted
if($_SERVER["REQUEST_METHOD"] == "POST"){

    // Check if username is empty
    if(empty(trim($_POST["name"]))){
        $name_err = "Please enter username.";
    } else{
        $name = trim($_POST["name"]);
    }
    
    // Check if password is empty
    if(empty(trim($_POST["password"]))){
        $password_err = "Please enter your password.";
    } else{
        $password = trim($_POST["password"]);
    }
  
    // Validate credentials
    if(empty($name_err) && empty($password_err)){
      // Prepare a select statement
        $sql = "SELECT id, username, password FROM users WHERE username = ?";
      
        if($stmt = mysqli_prepare($link, $sql)){
          // Bind variables to the prepared statement as parameters
            mysqli_stmt_bind_param($stmt, "s", $param_name);
            
            // Set parameters
            $param_name = $name;
          
            // Attempt to execute the prepared statement
            if(mysqli_stmt_execute($stmt)){
              // Store result
                mysqli_stmt_store_result($stmt);
     
                // Check if username exists, if yes then verify password
                if(mysqli_stmt_num_rows($stmt) == 1){                    
                  // Bind result variables
                    mysqli_stmt_bind_result($stmt, $id, $name, $hashed_password);
                    if(mysqli_stmt_fetch($stmt)){
                      if(password_verify($password, $hashed_password)){
                        // Password is correct, so start a new session
                            session_start();
                            
                            // Store data in session variables
                            $_SESSION["loggedin"] = true;
                            $_SESSION["id"] = $id;
                            $_SESSION["name"] = $name;                            
                            
                            // Redirect user to welcome page
                            echo "LOGIN SUCCESS";
                            // header("location: ../php/welcome.php");
                        } else{
                            // Password is not valid, display a generic error message
                            $login_err = "Invalid username or password.";
                            echo $login_err;
                          }
                    }
                } else{
                    // Username doesn't exist, display a generic error message
                    $login_err = "Invalid username or password.";
                    echo $login_err;
                  }
            } else{
                echo "Oops! Something went wrong. Please try again later.";
            }

            // Close statement
            mysqli_stmt_close($stmt);
        }
    } else {
      echo $name_err;
      echo $password_err;
      echo $login_err;
    }
    // Close connection
    mysqli_close($link);
}
?>