CREATE DATABASE  IF NOT EXISTS `db2` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `db2`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: db2
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Смешное','Ha ha ha! special LOL'),(2,'Dad','Dad legend'),(3,'Special','Special category'),(4,'Grammar','Изучение грамматики английского языка'),(5,'Vocabulary','Расширение словарного запаса'),(6,'Phrasal Verbs','Изучение фразовых глаголов'),(7,'Business English','Деловой английский'),(8,'Travel','Английский для путешествий'),(9,'Idioms','Английские идиомы и выражения'),(10,'Pronunciation','Правильное произношение'),(11,'Listening','Развитие навыков аудирования');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_requests`
--

DROP TABLE IF EXISTS `class_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `student_id` int NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `request_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_request` (`class_id`,`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_requests`
--

LOCK TABLES `class_requests` WRITE;
/*!40000 ALTER TABLE `class_requests` DISABLE KEYS */;
INSERT INTO `class_requests` VALUES (2,3,5,'approved','2025-03-31 11:22:37'),(3,3,6,'approved','2025-03-31 11:25:29'),(4,3,8,'approved','2025-04-12 20:05:21'),(5,5,6,'pending','2025-04-12 21:25:34'),(6,6,1,'pending','2025-04-12 21:25:34'),(7,7,5,'pending','2025-04-12 21:25:34'),(8,8,4,'pending','2025-04-12 21:25:34');
/*!40000 ALTER TABLE `class_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_students`
--

DROP TABLE IF EXISTS `class_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_id` int DEFAULT NULL,
  `student_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_class_id_idx` (`class_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_students`
--

LOCK TABLES `class_students` WRITE;
/*!40000 ALTER TABLE `class_students` DISABLE KEYS */;
INSERT INTO `class_students` VALUES (1,1,1),(2,2,1),(4,3,5),(5,3,6),(6,3,8),(7,5,1),(8,5,4),(9,5,5),(10,6,6),(11,6,9),(12,6,10),(13,7,11),(14,7,12),(15,7,13),(16,8,1),(17,8,5),(18,8,6);
/*!40000 ALTER TABLE `class_students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `teacher_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,'A class',2),(2,'B class',3),(3,'ИСП-322',8),(4,'ИСП-312',8),(5,'Advanced English',2),(6,'Business English Group',3),(7,'Conversation Club',8),(8,'Exam Preparation',2);
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(2555) DEFAULT NULL,
  `teacher_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_category_id_idx` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'Шутки в городе',2,1),(2,'1',2,2),(3,'Курс для чайников!',8,1),(5,'Basic Grammar',2,4),(6,'Advanced Vocabulary',3,5),(7,'Essential Phrasal Verbs',8,6),(8,'Business Communication',8,7),(9,'Travel Phrases',2,8),(10,'Common Idioms',3,9),(11,'Pronunciation Guide',8,10),(12,'Listening Practice',2,11);
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lesson_result`
--

DROP TABLE IF EXISTS `lesson_result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson_result` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lesson_id` int NOT NULL,
  `student_id` int NOT NULL,
  `current_score` int DEFAULT NULL,
  `execution_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_lesson_id_idx` (`lesson_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lesson_result`
--

LOCK TABLES `lesson_result` WRITE;
/*!40000 ALTER TABLE `lesson_result` DISABLE KEYS */;
INSERT INTO `lesson_result` VALUES (1,1,1,10,'2025-03-09 00:00:00'),(2,2,1,10,'2025-03-09 00:00:00'),(9,1,8,15,'2025-03-31 00:00:00'),(10,4,8,5,'2025-04-12 00:00:00'),(11,4,5,10,'2025-03-30 00:00:00'),(12,5,5,5,'2025-03-30 00:00:00'),(13,1,5,15,'2025-04-06 00:00:00'),(14,13,8,10,'2025-04-12 00:00:00');
/*!40000 ALTER TABLE `lesson_result` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lessons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(255) DEFAULT NULL,
  `course_id` int DEFAULT NULL,
  `order` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_course_id_idx` (`course_id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons`
--

LOCK TABLES `lessons` WRITE;
/*!40000 ALTER TABLE `lessons` DISABLE KEYS */;
INSERT INTO `lessons` VALUES (1,'FOR DAD',1,1),(2,'1',2,1),(4,'Это мой второй урок для вас! Пройдите его!',3,2),(5,'Это мой первый урок для вас! Пройдите его!',3,1),(7,'Это мой третий Урок для вас! Пройдите его!',3,3),(8,'Present Simple Tense',4,1),(9,'Past Simple Tense',4,2),(10,'Future Tenses',4,3),(11,'Modal Verbs',4,4),(12,'Conditionals',4,5),(13,'Kitchen Vocabulary',5,1),(14,'Office Vocabulary',5,2),(15,'Technology Terms',5,3),(16,'Get Phrasal Verbs',6,1),(17,'Take Phrasal Verbs',6,2),(18,'Business Meetings',7,1),(19,'Email Writing',7,2),(20,'Airport Phrases',8,1),(21,'Hotel Communication',8,2),(22,'Animal Idioms',9,1),(23,'Food Idioms',9,2),(24,'Vowel Sounds',10,1),(25,'Consonant Sounds',10,2),(26,'News Listening',11,1),(27,'Conversation Practice',11,2);
/*!40000 ALTER TABLE `lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lesson_id` int DEFAULT NULL,
  `question` varchar(255) DEFAULT NULL,
  `text` text,
  `options` json DEFAULT NULL,
  `answer` int DEFAULT NULL,
  `score` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_lesson_id_idx` (`lesson_id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (0,1,'Как пишется яблоко?',NULL,'[\"apple\", \"aple\", \"applle\", \"aplle\"]',0,5),(2,1,'How we can translate \"this\"?',NULL,'[\"вниз\", \"это\", \"собака\", \"нет\"]',1,5),(3,1,'Как переводится \"Кот\"?',NULL,'[\"dog\", \"Sock\", \"cat\", \"rain\"]',2,5),(5,4,'Как переводится \"time\"?','','[\"время\", \"деньги\", \"потеха\", \"час\"]',0,5),(7,4,'Продолжи фразу: East or West — ...','','[\"...notrh is cold\", \"...home is best\", \"...sourth is hot\", \"...house is best\"]',1,5),(8,5,'test?','','[\"тест\", \"тист\", \"таст\", \"туст\"]',0,5),(9,7,'Как переводится \"time\"?','','[\"Час\", \"Время\", \"Колокол\", \"Таймер\"]',1,5),(10,6,'Which sentence is in Present Simple?',NULL,'[\"I am eating now\", \"I eat breakfast every day\", \"I was eating yesterday\", \"I will eat later\"]',1,5),(11,6,'What is the correct form for \"he\" in Present Simple?',NULL,'[\"go\", \"goes\", \"going\", \"gone\"]',1,5),(12,7,'Which is the correct Past Simple form of \"go\"?',NULL,'[\"goed\", \"went\", \"gone\", \"going\"]',1,5),(13,7,'Complete the sentence: She ___ to school yesterday.',NULL,'[\"go\", \"goes\", \"went\", \"gone\"]',2,5),(14,8,'Which is correct for Future Simple?',NULL,'[\"I will go\", \"I am going\", \"I go\", \"I went\"]',0,5),(15,8,'What is the correct negative form?',NULL,'[\"I will not go\", \"I not will go\", \"I will go not\", \"I will no go\"]',0,5),(16,9,'Choose the correct modal verb: You ___ stop when the traffic light is red.',NULL,'[\"can\", \"may\", \"must\", \"might\"]',2,5),(17,9,'Which modal expresses ability?',NULL,'[\"must\", \"should\", \"can\", \"would\"]',2,5),(18,10,'Complete: If it rains, I ___ stay at home.',NULL,'[\"will\", \"would\", \"am\", \"was\"]',0,5),(19,10,'Which is a zero conditional?',NULL,'[\"If you heat ice, it melts\", \"If you heated ice, it would melt\", \"If you had heated ice, it would have melted\", \"If you heat ice, it will melt\"]',0,5),(20,11,'What is a cutting board used for?',NULL,'[\"eating\", \"chopping food\", \"serving food\", \"mixing ingredients\"]',1,5),(21,11,'Which is not kitchenware?',NULL,'[\"frying pan\", \"blender\", \"stapler\", \"whisk\"]',2,5),(22,12,'What do you call a person who works in an office?',NULL,'[\"office worker\", \"office man\", \"office person\", \"office guy\"]',0,5),(23,12,'What is a \"deadline\"?',NULL,'[\"a line that is dead\", \"a time limit\", \"a meeting\", \"a type of desk\"]',1,5),(24,13,'What does \"browser\" mean?',NULL,'[\"a person who looks in shops\", \"a software to access the internet\", \"a type of computer\", \"a search engine\"]',1,5),(25,13,'What is \"Wi-Fi\"?',NULL,'[\"a type of coffee\", \"wireless internet\", \"a computer brand\", \"a phone app\"]',1,5),(26,14,'What does \"get up\" mean?',NULL,'[\"stand up\", \"go to bed\", \"wake up\", \"both 1 and 3\"]',3,5),(27,14,'What does \"get over\" mean?',NULL,'[\"climb over\", \"recover from\", \"forget about\", \"ignore\"]',1,5),(28,15,'Complete: \"take ___\" (to begin a journey)',NULL,'[\"up\", \"off\", \"on\", \"in\"]',1,5),(29,15,'What does \"take after\" mean?',NULL,'[\"look like\", \"follow\", \"care for\", \"resemble a parent\"]',3,5);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `login` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(45) NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `login_UNIQUE` (`login`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'dad','dad','student','dad'),(2,'1','1','teacher','1'),(3,'vika@sas.ru','vava','teacher','vika'),(4,'vladmen@ru','123123','student','Владик'),(5,'123@mail.ru','123123','student','123'),(6,'Alexeev.antoniy@gmail.com','123123','student','ArkaJl'),(8,'1@mail.ru','123123','teacher','ArkaJl'),(9,'anonim@mail.ru','123123','student','Анонимов Аноним'),(10,'vitya01@mail.ru','123123','student','Виктор'),(11,'vitya02@mail.ru','123123','student','Vitya'),(12,'thelol20002@mail.ru','123123','student','Kosovan'),(13,'vladman@mail.ru','132123','student','Владислав');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-12 21:39:11
