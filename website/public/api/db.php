<?php
/**
 * Charithra Learning Hub - Hostinger MySQL Database Configuration
 * Set your Hostinger MySQL details here (from hPanel -> MySQL Databases)
 */
define('DB_HOST', 'localhost');
define('DB_NAME', 'u766698539_charithra');  // Replace with your Hostinger DB Name
define('DB_USER', 'u766698539_admin');      // Replace with your Hostinger DB Username
define('DB_PASS', 'Charithra@2026');         // Replace with your Hostinger DB Password

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                "success" => false, 
                "error" => "Database Connection Failed: " . $e->getMessage(),
                "hint" => "Please verify DB_NAME, DB_USER, and DB_PASS in api/db.php"
            ]);
            exit;
        }
    }
    return $pdo;
}
