/*
 Navicat Premium Data Transfer

 Source Server Type    : MySQL

 Target Server Type    : MySQL

 Date: 30/04/2022 15:40:09
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for elec_record
-- ----------------------------
DROP TABLE IF EXISTS `elec_record`;
CREATE TABLE `elec_record`  (
  `id` int(0) UNSIGNED NOT NULL AUTO_INCREMENT,
  `remain_power` float NULL DEFAULT NULL,
  `date` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
