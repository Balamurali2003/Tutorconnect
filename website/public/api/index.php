<?php
/**
 * Charithra Learning Hub - Hostinger MySQL API Endpoint
 * Handles Website Enquiries, Workshop Bookings, Tutor Applications & CRM Leads
 */

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

// Route parsing
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Normalize uri relative to api folder
$uri = preg_replace('#^.*/api/#', '', $uri);
$uri = trim($uri, '/');
$method = $_SERVER['REQUEST_METHOD'];

$inputJSON = file_get_contents('php://input');
$body = json_decode($inputJSON, true) ?: [];

// Router
try {
    $db = getDB();

    // 1. Health Status
    if ($uri === 'public/status' || $uri === 'status' || $uri === '') {
        echo json_encode([
            "status" => "online",
            "service" => "Charithra Learning Hub Hostinger MySQL API",
            "database" => "MySQL Connected",
            "timestamp" => date("c")
        ]);
        exit;
    }

    // 2. Academic Tuition Enquiry
    if ($uri === 'public/enquiry' && $method === 'POST') {
        $studentName = trim($body['studentName'] ?? '');
        $parentPhone = trim($body['parentPhone'] ?? '');
        if (empty($studentName) || empty($parentPhone)) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Student Name and Phone Number are required"]);
            exit;
        }

        $id = 'lead-web-' . round(microtime(true) * 1000);
        $grade = $body['grade'] ?? 'Grade 8';
        $board = $body['board'] ?? 'CBSE';
        $mode = strtoupper($body['learningMode'] ?? 'Both');
        $subjects = is_array($body['selectedSubjects'] ?? null) ? implode(', ', $body['selectedSubjects']) : ($body['selectedSubjects'] ?? 'General Academics');
        $message = "Academic Tuition Enquiry for {$studentName} ({$grade}, {$board}). Mode: {$mode}. Subjects: {$subjects}.";

        $stmt = $db->prepare("
            INSERT INTO leads (id, leadSource, platform, name, phoneNumber, campaignName, adName, subjects, experience, message, status)
            VALUES (?, 'WEBSITE', 'website', ?, ?, 'Academic Tuition Enquiry', ?, ?, ?, ?, 'NEW_LEAD')
        ");
        $stmt->execute([$id, $studentName, $parentPhone, $mode . ' Mode', $subjects, "{$grade} ({$board})", $message]);

        // Add admin notification
        $notifStmt = $db->prepare("INSERT INTO notifications (id, title, message, type, link) VALUES (?, ?, ?, 'info', '/leads')");
        $notifStmt->execute(['notif-' . round(microtime(true) * 1000), 'New Website Tuition Enquiry', "{$studentName} enrolled for {$subjects} ({$grade}). Phone: {$parentPhone}"]);

        http_response_code(201);
        echo json_encode([
            "success" => true,
            "lead" => ["id" => $id, "name" => $studentName, "leadSource" => "WEBSITE"],
            "message" => "Enquiry stored in Hostinger MySQL database successfully"
        ]);
        exit;
    }

    // 3. One-Day Workshop Booking
    if ($uri === 'public/workshop' && $method === 'POST') {
        $childName = trim($body['childName'] ?? '');
        $parentPhone = trim($body['parentPhone'] ?? '');
        if (empty($childName) || empty($parentPhone)) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Child Name and Phone Number are required"]);
            exit;
        }

        $id = 'lead-ws-' . round(microtime(true) * 1000);
        $trackTitle = $body['selectedTrackTitle'] ?? 'Future Skills Workshop';
        $date = $body['selectedDate'] ?? 'Next Weekend';
        $grade = $body['childGrade'] ?? 'School Student';
        $message = "One-Day Workshop Booking for {$childName} ({$grade}). Workshop: {$trackTitle}. Slot: {$date}.";

        $stmt = $db->prepare("
            INSERT INTO leads (id, leadSource, platform, name, phoneNumber, campaignName, adName, subjects, experience, message, status)
            VALUES (?, 'WEBSITE', 'website', ?, ?, ?, 'One-Day Technology Pass', ?, ?, ?, 'NEW_LEAD')
        ");
        $stmt->execute([$id, $childName, $parentPhone, "Workshop - {$trackTitle}", $trackTitle, "{$grade} | {$date}", $message]);

        // Add notification
        $notifStmt = $db->prepare("INSERT INTO notifications (id, title, message, type, link) VALUES (?, ?, ?, 'success', '/leads')");
        $notifStmt->execute(['notif-' . round(microtime(true) * 1000), 'New Workshop Booking', "{$childName} booked for {$trackTitle}. Phone: {$parentPhone}"]);

        http_response_code(201);
        echo json_encode([
            "success" => true,
            "lead" => ["id" => $id, "name" => $childName, "leadSource" => "WEBSITE"],
            "message" => "Workshop seat reserved in Hostinger MySQL database"
        ]);
        exit;
    }

    // 4. Teacher / Tutor Career Application
    if ($uri === 'public/tutor-apply' && $method === 'POST') {
        $fullName = trim($body['fullName'] ?? '');
        $phone = trim($body['phone'] ?? '');
        if (empty($fullName) || empty($phone)) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Full Name and Phone Number are required"]);
            exit;
        }

        // Count tutors for sequential ID
        $count = $db->query("SELECT COUNT(*) FROM tutors")->fetchColumn();
        $tutorSeq = 'TUT-2026-' . str_pad($count + 1, 3, '0', STR_PAD_LEFT);
        $id = 'tut-' . round(microtime(true) * 1000);

        $email = trim($body['email'] ?? '');
        $qualification = $body['qualification'] ?? 'Graduate';
        $experience = $body['experience'] ?? '1 Year';
        $subjects = is_array($body['subjects'] ?? null) ? implode(', ', $body['subjects']) : ($body['subjects'] ?? 'General');
        $location = $body['preferredLocation'] ?? 'Centre / Online';
        $notes = $body['message'] ?? 'Direct website application';

        $stmt = $db->prepare("
            INSERT INTO tutors (id, tutorId, fullName, mobile, phone, whatsapp, email, qualification, experience, subjects, subjectsText, preferredLocation, notes, status, leadSource)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW_APPLICATION', 'WEBSITE')
        ");
        $stmt->execute([$id, $tutorSeq, $fullName, $phone, $phone, $phone, $email, $qualification, $experience, $subjects, $subjects, $location, $notes]);

        // Insert linked lead
        $leadId = 'lead-tutor-' . round(microtime(true) * 1000);
        $leadMsg = "Teacher Career Application: {$fullName} ({$qualification}). Subjects: {$subjects}.";
        $lstmt = $db->prepare("
            INSERT INTO leads (id, leadSource, platform, name, phoneNumber, email, campaignName, subjects, experience, message, status, convertedType, convertedId)
            VALUES (?, 'WEBSITE', 'website', ?, ?, ?, 'Website Teacher Career Application', ?, ?, ?, 'CONVERTED', 'TUTOR', ?)
        ");
        $lstmt->execute([$leadId, $fullName, $phone, $email, $subjects, $experience, $leadMsg, $id]);

        http_response_code(201);
        echo json_encode([
            "success" => true,
            "tutor" => ["tutorId" => $tutorSeq, "fullName" => $fullName, "status" => "NEW_APPLICATION"],
            "lead" => ["id" => $leadId],
            "message" => "Teacher application saved to Hostinger MySQL with ID: {$tutorSeq}"
        ]);
        exit;
    }

    // 5. Get Leads
    if ($uri === 'leads' && $method === 'GET') {
        $source = $_GET['source'] ?? '';
        if (!empty($source) && $source !== 'ALL') {
            $stmt = $db->prepare("SELECT * FROM leads WHERE UPPER(leadSource) = UPPER(?) ORDER BY createdAt DESC");
            $stmt->execute([$source]);
        } else {
            $stmt = $db->query("SELECT * FROM leads ORDER BY createdAt DESC");
        }
        $leads = $stmt->fetchAll();
        echo json_encode(["leads" => $leads, "total" => count($leads)]);
        exit;
    }

    // 6. User Login (Admin, Tutor, Parent)
    if ($uri === 'auth/login' && $method === 'POST') {
        $username = trim($body['username'] ?? '');
        $password = trim($body['password'] ?? '');

        $stmt = $db->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && $user['password'] === $password) {
            unset($user['password']);
            echo json_encode([
                "success" => true,
                "token" => base64_encode(json_encode(["userId" => $user['id'], "role" => $user['role'], "name" => $user['name']])),
                "user" => $user
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["success" => false, "error" => "Invalid Username or Password"]);
        }
        exit;
    }

    // Unknown route
    http_response_code(404);
    echo json_encode(["error" => "Endpoint not found: {$uri}"]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
