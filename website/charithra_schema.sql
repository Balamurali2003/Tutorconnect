-- =======================================================
-- CHARITHRA LEARNING HUB - HOSTINGER MYSQL DATABASE SCHEMA
-- Compatible with Hostinger phpMyAdmin & MySQL 5.7 / 8.0+
-- =======================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+05:30";

-- --------------------------------------------------------
-- 1. Table: `leads` (Captures Website Enquiries, Workshops & Applications)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `leads` (
  `id` varchar(64) NOT NULL,
  `leadSource` varchar(32) NOT NULL DEFAULT 'WEBSITE',
  `platform` varchar(32) DEFAULT 'website',
  `name` varchar(128) NOT NULL,
  `phoneNumber` varchar(32) NOT NULL,
  `email` varchar(128) DEFAULT 'Not Provided',
  `externalLeadId` varchar(64) DEFAULT NULL,
  `campaignName` varchar(128) DEFAULT 'Academic Tuition Enquiry',
  `adName` varchar(128) DEFAULT NULL,
  `subjects` text DEFAULT NULL,
  `experience` varchar(128) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `messages_json` longtext DEFAULT NULL,
  `status` varchar(32) NOT NULL DEFAULT 'NEW_LEAD',
  `convertedType` varchar(32) DEFAULT NULL,
  `convertedId` varchar(64) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_leads_source` (`leadSource`),
  KEY `idx_leads_status` (`status`),
  KEY `idx_leads_phone` (`phoneNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Table: `tutors` (Faculty, Appointed Tutors & Applicants)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tutors` (
  `id` varchar(64) NOT NULL,
  `tutorId` varchar(32) NOT NULL,
  `externalLeadId` varchar(64) DEFAULT NULL,
  `fullName` varchar(128) NOT NULL,
  `mobile` varchar(32) NOT NULL,
  `phone` varchar(32) DEFAULT NULL,
  `whatsapp` varchar(32) DEFAULT NULL,
  `email` varchar(128) DEFAULT NULL,
  `gender` varchar(16) DEFAULT 'Not Provided',
  `dob` varchar(32) DEFAULT 'Not Provided',
  `qualification` varchar(128) DEFAULT 'Graduate',
  `specialization` varchar(128) DEFAULT 'General',
  `experience` varchar(64) DEFAULT '1 Year',
  `experienceYears` int(11) DEFAULT 1,
  `subjects` text DEFAULT NULL,
  `subjectsText` text DEFAULT NULL,
  `homeTuitionAvailable` varchar(8) DEFAULT 'yes',
  `preferredLocation` varchar(128) DEFAULT 'Centre / Online',
  `availableTiming` varchar(128) DEFAULT 'Flexible',
  `expectedSalary` decimal(10,2) DEFAULT 15000.00,
  `priority` varchar(32) DEFAULT 'NOT_ASSIGNED',
  `priorityScore` int(11) DEFAULT 0,
  `status` varchar(32) NOT NULL DEFAULT 'NEW_APPLICATION',
  `leadSource` varchar(32) DEFAULT 'WEBSITE',
  `platform` varchar(32) DEFAULT 'website',
  `campaignName` varchar(128) DEFAULT NULL,
  `adName` varchar(128) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `interviewResult` varchar(32) DEFAULT 'Pending',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_tutorId` (`tutorId`),
  KEY `idx_tutor_mobile` (`mobile`),
  KEY `idx_tutor_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Table: `tutor_documents`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tutor_documents` (
  `id` varchar(64) NOT NULL,
  `tutorId` varchar(64) NOT NULL,
  `docType` varchar(64) NOT NULL,
  `fileName` varchar(255) DEFAULT NULL,
  `status` varchar(32) DEFAULT 'Pending',
  `remarks` text DEFAULT NULL,
  `uploadedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_doc_tutorId` (`tutorId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Table: `students`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `students` (
  `id` varchar(64) NOT NULL,
  `studentId` varchar(32) NOT NULL,
  `studentName` varchar(128) NOT NULL,
  `phone` varchar(32) DEFAULT NULL,
  `parentPhone` varchar(32) DEFAULT NULL,
  `email` varchar(128) DEFAULT NULL,
  `class` varchar(32) DEFAULT NULL,
  `school` varchar(128) DEFAULT NULL,
  `requiredSubjects` text DEFAULT NULL,
  `assignedTutorId` varchar(64) DEFAULT NULL,
  `status` varchar(32) DEFAULT 'ACTIVE',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Table: `parents`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `parents` (
  `id` varchar(64) NOT NULL,
  `parentId` varchar(32) NOT NULL,
  `parentName` varchar(128) NOT NULL,
  `mobile` varchar(32) DEFAULT NULL,
  `email` varchar(128) DEFAULT NULL,
  `studentIds` text DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Table: `notifications`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` varchar(64) NOT NULL,
  `title` varchar(128) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(32) DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `link` varchar(255) DEFAULT '/leads',
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. Table: `users` (Portal Login for Admin, Tutor, Parent)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(64) NOT NULL,
  `username` varchar(64) NOT NULL,
  `password` varchar(128) NOT NULL,
  `role` varchar(32) NOT NULL DEFAULT 'Admin',
  `name` varchar(128) NOT NULL,
  `tutorId` varchar(64) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Default Administrator Account (Username: admin | Password: 1234)
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `username`, `password`, `role`, `name`) 
VALUES ('usr-admin', 'admin', '1234', 'Admin', 'Charithra Administrator')
ON DUPLICATE KEY UPDATE `password`='1234';

COMMIT;
