-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 25, 2025 at 03:25 PM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ecampus`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` bigint NOT NULL,
  `session_id` bigint NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `status` enum('present','present_manual','absent') NOT NULL,
  `reason` enum('none','permit','sick','other') NOT NULL DEFAULT 'none',
  `source` enum('rfid','manual') NOT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `lat` decimal(10,7) DEFAULT NULL,
  `lng` decimal(10,7) DEFAULT NULL,
  `village` varchar(80) DEFAULT NULL,
  `district` varchar(80) DEFAULT NULL,
  `regency` varchar(80) DEFAULT NULL,
  `taken_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `note` varchar(255) DEFAULT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `loc_label` varchar(150) DEFAULT NULL,
  `location_label` varchar(255) DEFAULT NULL,
  `accuracy` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `session_id`, `user_id`, `status`, `reason`, `source`, `photo_url`, `lat`, `lng`, `village`, `district`, `regency`, `taken_at`, `note`, `photo_path`, `loc_label`, `location_label`, `accuracy`) VALUES
(194, 8, 8, 'present', 'none', 'rfid', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 20:43:40', NULL, NULL, NULL, NULL, NULL),
(195, 8, 9, 'present', 'none', 'rfid', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 20:43:40', NULL, NULL, NULL, NULL, NULL),
(196, 8, 10, 'present', 'none', 'rfid', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 20:43:40', NULL, NULL, NULL, NULL, NULL),
(197, 8, 11, 'present', 'none', 'rfid', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 20:43:40', NULL, NULL, NULL, NULL, NULL),
(198, 9, 8, 'present', 'none', 'rfid', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 20:43:40', NULL, NULL, NULL, NULL, NULL),
(199, 9, 9, 'present', 'none', 'rfid', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 20:43:40', NULL, NULL, NULL, NULL, NULL),
(200, 9, 10, 'present', 'none', 'rfid', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 20:43:40', NULL, NULL, NULL, NULL, NULL),
(201, 9, 11, 'present_manual', 'none', 'manual', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 20:43:40', NULL, NULL, NULL, NULL, NULL),
(202, 10, 8, 'present', 'none', 'rfid', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 20:43:40', NULL, NULL, NULL, NULL, NULL),
(203, 10, 9, 'present', 'none', 'rfid', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 20:43:40', NULL, NULL, NULL, NULL, NULL),
(204, 10, 10, 'present', 'none', 'rfid', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 20:43:40', NULL, NULL, NULL, NULL, NULL),
(205, 10, 11, 'present', 'none', 'rfid', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 20:43:40', NULL, NULL, NULL, NULL, NULL),
(206, 11, 8, 'absent', 'permit', 'manual', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 20:43:40', NULL, NULL, NULL, NULL, NULL),
(207, 11, 9, 'present', 'none', 'rfid', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 20:43:40', NULL, NULL, NULL, NULL, NULL),
(208, 11, 10, 'present', 'none', 'rfid', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 20:43:40', NULL, NULL, NULL, NULL, NULL),
(209, 11, 11, 'present', 'none', 'rfid', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 20:43:40', NULL, NULL, NULL, NULL, NULL),
(210, 12, 8, 'present', 'none', 'rfid', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 20:43:40', NULL, NULL, NULL, NULL, NULL),
(211, 12, 9, 'present_manual', 'none', 'manual', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 20:43:40', NULL, NULL, NULL, NULL, NULL),
(212, 12, 10, 'absent', 'none', 'manual', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-25 11:28:37', NULL, NULL, NULL, NULL, NULL),
(213, 12, 11, 'present', 'none', 'rfid', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 20:43:40', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` bigint UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(160) NOT NULL,
  `semester` enum('ganjil','genap') NOT NULL DEFAULT 'ganjil',
  `year` varchar(9) NOT NULL,
  `program` varchar(80) DEFAULT NULL,
  `room_id` bigint DEFAULT NULL,
  `room` varchar(80) DEFAULT NULL,
  `day_of_week` tinyint UNSIGNED DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `code`, `name`, `semester`, `year`, `program`, `room_id`, `room`, `day_of_week`, `start_time`, `end_time`, `is_active`, `created_at`) VALUES
(101, '2515520028', 'CAPSTONE PROJECT', 'ganjil', '2025/2026', 'S1-IF', 1, 'FASILKOM 4.79-5 (251-7A-22)', 1, '08:00:00', '10:00:00', 1, '2025-10-25 17:01:58');

-- --------------------------------------------------------

--
-- Table structure for table `class_instructors`
--

CREATE TABLE `class_instructors` (
  `class_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `class_students`
--

CREATE TABLE `class_students` (
  `class_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rfid_logs`
--

CREATE TABLE `rfid_logs` (
  `id` bigint NOT NULL,
  `reader_id` bigint NOT NULL,
  `uid` varchar(64) DEFAULT NULL,
  `event` enum('scan','grant','deny','heartbeat','error') NOT NULL DEFAULT 'scan',
  `status` enum('ok','ignored','error') NOT NULL DEFAULT 'ok',
  `message` varchar(255) DEFAULT NULL,
  `rssi` int DEFAULT NULL,
  `payload` text,
  `taken_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rfid_readers`
--

CREATE TABLE `rfid_readers` (
  `id` bigint NOT NULL,
  `name` varchar(120) NOT NULL,
  `room_id` bigint NOT NULL,
  `gateway_url` varchar(255) DEFAULT NULL,
  `secret` varchar(64) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `last_heartbeat` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `rfid_readers`
--

INSERT INTO `rfid_readers` (`id`, `name`, `room_id`, `gateway_url`, `secret`, `is_active`, `last_heartbeat`, `created_at`) VALUES
(1, 'Gateway Ruang 4.79-5', 1, NULL, 'SECRET-4795-ABC', 1, NULL, '2025-10-25 19:01:46');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` bigint NOT NULL,
  `code` varchar(32) DEFAULT NULL,
  `name` varchar(120) DEFAULT NULL,
  `location` varchar(160) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `code`, `name`, `location`, `is_active`, `created_at`) VALUES
(1, 'FIK-4795', 'FASILKOM 4.79-5', 'Gedung Fasilkom', 1, '2025-10-25 19:01:22');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` bigint NOT NULL,
  `class_id` bigint NOT NULL,
  `topic` varchar(160) DEFAULT NULL,
  `start_at` datetime NOT NULL,
  `end_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `class_id`, `topic`, `start_at`, `end_at`, `created_at`) VALUES
(8, 101, 'Pertemuan 1', '2025-08-18 02:00:00', '2025-08-18 03:40:00', '2025-10-24 02:59:44'),
(9, 101, 'Pertemuan 2', '2025-09-01 02:00:00', '2025-09-01 03:40:00', '2025-10-24 02:59:44'),
(10, 101, 'Pertemuan 3', '2025-09-15 02:00:00', '2025-09-15 03:40:00', '2025-10-24 02:59:44'),
(11, 101, 'Pertemuan 4', '2025-09-29 02:00:00', '2025-09-29 03:40:00', '2025-10-24 02:59:44'),
(12, 101, 'Pertemuan 5', '2025-10-13 02:00:00', '2025-10-13 03:40:00', '2025-10-24 02:59:44'),
(13, 101, 'Pertemuan 6', '2025-10-27 00:00:00', '2025-10-27 23:59:59', '2025-10-24 02:59:44'),
(14, 101, 'Pertemuan 7', '2025-11-10 02:00:00', '2025-11-10 03:40:00', '2025-10-24 02:59:44'),
(15, 102, '1', '2025-10-25 17:37:00', '2025-10-25 17:41:00', '2025-10-25 17:37:10');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` bigint NOT NULL,
  `academic_year_label` varchar(32) DEFAULT NULL,
  `timezone` varchar(64) DEFAULT 'Asia/Jakarta',
  `default_gateway_base_url` varchar(255) DEFAULT NULL,
  `default_reader_secret` varchar(128) DEFAULT NULL,
  `heartbeat_timeout_sec` int DEFAULT '120',
  `scan_early_min` int DEFAULT '5',
  `scan_late_min` int DEFAULT '10',
  `manual_edit_days` int DEFAULT '3',
  `holiday_mode` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `academic_year_label`, `timezone`, `default_gateway_base_url`, `default_reader_secret`, `heartbeat_timeout_sec`, `scan_early_min`, `scan_late_min`, `manual_edit_days`, `holiday_mode`, `created_at`, `updated_at`) VALUES
(1, '2025/2026 Ganjil', 'Asia/Jakarta', NULL, NULL, 120, 5, 10, 3, 0, '2025-10-25 22:02:50', '2025-10-25 22:02:50');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint NOT NULL,
  `name` varchar(120) NOT NULL,
  `nim` varchar(30) DEFAULT NULL,
  `email` varchar(160) NOT NULL,
  `rfid_uid` varchar(64) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('staff','student','admin') NOT NULL DEFAULT 'student',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `nim`, `email`, `rfid_uid`, `password`, `role`, `is_active`, `created_at`) VALUES
(1, 'Dosen Matkul', NULL, 'dosen@staff.unsika.ac.id', NULL, '123456', 'staff', 1, '2025-10-23 21:31:13'),
(8, 'MUHAMAD IKHSAN RIZQI YANUAR', '2210631170131', '2210631170131@student.unsika.ac.id', NULL, '123456', 'student', 1, '2025-10-25 00:53:34'),
(9, 'ANANTA ZIAUROHMAN AZ ZAKI', '2210631170007', '2210631170007@student.unsika.ac.id', NULL, '123456', 'student', 1, '2025-10-25 00:53:34'),
(10, 'MAHESWARA ABHISTA HAMDAN HAFIZ', '2210631170128', '2210631170128@student.unsika.ac.id', NULL, '123456', 'student', 1, '2025-10-25 00:53:34'),
(11, 'GUDANG GUNAWAN', '2210631170124', '2210631170124@student.unsika.ac.id', NULL, '123456', 'student', 1, '2025-10-25 00:53:34'),
(12, 'Administrator', NULL, 'admin@admin.unsika.ac.id', NULL, '123456', 'admin', 1, '2025-10-25 13:12:21');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_att` (`session_id`,`user_id`),
  ADD UNIQUE KEY `uniq_session_user` (`session_id`,`user_id`),
  ADD UNIQUE KEY `uq_attendance` (`session_id`,`user_id`),
  ADD KEY `ix_att_session` (`session_id`),
  ADD KEY `fk_att_user` (`user_id`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_classes_code_year` (`code`,`year`),
  ADD KEY `idx_classes_roomid_dow_time` (`room_id`,`day_of_week`,`start_time`,`end_time`,`is_active`);

--
-- Indexes for table `class_instructors`
--
ALTER TABLE `class_instructors`
  ADD PRIMARY KEY (`class_id`,`user_id`),
  ADD KEY `fk_ci_user` (`user_id`);

--
-- Indexes for table `class_students`
--
ALTER TABLE `class_students`
  ADD PRIMARY KEY (`class_id`,`user_id`),
  ADD KEY `fk_cs_user` (`user_id`);

--
-- Indexes for table `rfid_logs`
--
ALTER TABLE `rfid_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_log_reader` (`reader_id`);

--
-- Indexes for table `rfid_readers`
--
ALTER TABLE `rfid_readers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_reader_room` (`room_id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_sessions_class_time` (`class_id`,`start_at`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `rfid_uid` (`rfid_uid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=215;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT for table `rfid_logs`
--
ALTER TABLE `rfid_logs`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rfid_readers`
--
ALTER TABLE `rfid_readers`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `fk_att_session` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `fk_classes_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`);

--
-- Constraints for table `class_instructors`
--
ALTER TABLE `class_instructors`
  ADD CONSTRAINT `fk_ci_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ci_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `class_students`
--
ALTER TABLE `class_students`
  ADD CONSTRAINT `fk_cs_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rfid_logs`
--
ALTER TABLE `rfid_logs`
  ADD CONSTRAINT `fk_log_reader` FOREIGN KEY (`reader_id`) REFERENCES `rfid_readers` (`id`);

--
-- Constraints for table `rfid_readers`
--
ALTER TABLE `rfid_readers`
  ADD CONSTRAINT `fk_reader_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
