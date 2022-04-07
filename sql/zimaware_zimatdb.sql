/*REALISATION DATABASE FOR TICKETMARKETPLACE PROJECT*/
-- DROP SCHEMA IF EXISTS `zimaware_zimatdb`;
-- CREATE SCHEMA IF NOT EXISTS `zimatdb` DEFAULT CHARACTER SET utf8 ;
-- USE `zimaware_zimatdb` ;

-- -----------------------------------------------------
-- Table `zimaware_zimatdb`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimaware_zimatdb`.`user` (
  `idUser` INT NOT NULL auto_increment,
  `username` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NULL,
  `password` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`idUser`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimaware_zimatdb`.`user_profile`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimaware_zimatdb`.`user_profile` (
  `idUserFK` INT NOT NULL,
  `avatar` VARCHAR(255) NULL DEFAULT "NONE",
  `firstName` VARCHAR(255) NULL DEFAULT "NONE",
  `lastName` VARCHAR(255) NULL DEFAULT "NONE",
  `address` VARCHAR(255) NULL DEFAULT "NONE",
  `bio` TEXT(300) NULL,
  `verification_email` BOOLEAN NOT NULL DEFAULT 0,
  PRIMARY KEY (`idUserFK`),
  INDEX `fk_idUserFK_user_user_profile_index` (`idUserFK` ASC),
  CONSTRAINT `fk_idUserFK_user_user_profile`
	FOREIGN KEY (`idUserFK`)
    REFERENCES `zimaware_zimatdb`.`user` (`idUser`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimaware_zimatdb`.`verification_code`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimaware_zimatdb`.`verification_code` (
  `idVc` INT NOT NULL auto_increment,
  `idUserFK` INT NOT NULL,
  `code` VARCHAR(255) NULL,
  `type` VARCHAR(255) NULL,
  PRIMARY KEY (`idVc`),
    INDEX `fk_idUserFK_user_verification_code_index` (`idUserFK` ASC),
  CONSTRAINT `fk_idUserFK_user_verification_code`
	FOREIGN KEY (`idUserFK`)
    REFERENCES `zimaware_zimatdb`.`user` (`idUser`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimaware_zimatdb`.`user_support`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimaware_zimatdb`.`user_support` (
  `idIssue` INT NOT NULL auto_increment,
  `email` VARCHAR(255) NOT NULL,
  `issue` TEXT(500) NULL,
  `support_type` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`idIssue`))
ENGINE = InnoDB;