/*REALISATION DATABASE FOR TICKETMARKETPLACE PROJECT*/
-- DROP SCHEMA IF EXISTS `zimacess_zimatdb`;
-- CREATE SCHEMA IF NOT EXISTS `zimacess_zimatdb` DEFAULT CHARACTER SET utf8 ;
USE `zimacess_zimatdb` ;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`world_timezone`------------------
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`world_timezone` (
  `idWTimezone` INT NOT NULL auto_increment,
  `GMT` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`idwtimezone`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`currency`------------------
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`currency` (
  `idCurrency` INT NOT NULL auto_increment,
  `currencyCode` VARCHAR(255) NOT NULL,
  `currencyName` VARCHAR(255) NULL,
  PRIMARY KEY (`idCurrency`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`country`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`country` (
  `idCountry` INT NOT NULL auto_increment,
  `name` VARCHAR(255),
  `idCurrencyFK` INT NULL,
  `language` VARCHAR(255),
  `isFederation` BOOLEAN DEFAULT 0,
  PRIMARY KEY (`idCountry`),
   INDEX `country_From_origin` (`idCountry` ASC),
  CONSTRAINT `fk_idCurrencyFK_idCurrency_country`
    FOREIGN KEY (`idCurrencyFK`)
    REFERENCES `zimacess_zimatdb`.`currency` (`idCurrency`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`cities`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`cities` (
  `idCity` INT NOT NULL auto_increment,
  `name` VARCHAR(255),
  `idCountryFK` INT NOT NULL,
  PRIMARY KEY (`idCity`),
   INDEX `cities_From_origin` (`idCity` ASC),
  CONSTRAINT `fk_idCountryFK_idCountry_cities`
    FOREIGN KEY (`idCountryFK`)
    REFERENCES `zimacess_zimatdb`.`country` (`idCountry`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`country_timezone`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`country_timezone` (
  `idCountryFK` INT NOT NULL,
  `idWTimezoneFK` INT NOT NULL,
  `note` TEXT(300) NULL,
  PRIMARY KEY (`idCountryFK`, `idWTimezoneFK`),
   INDEX `country_From_country_timezone` (`idCountryFK` ASC),
  CONSTRAINT `fk_idCountryFK_id_country_timezone`
    FOREIGN KEY (`idCountryFK`)
    REFERENCES `zimacess_zimatdb`.`country` (`idCountry`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
    CONSTRAINT `fk_idWTimezoneFK_id_country_timezone`
    FOREIGN KEY (`idWTimezoneFK`)
    REFERENCES `zimacess_zimatdb`.`world_timezone` (`idWTimezone`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`user` (
  `idUser` INT NOT NULL auto_increment,
  `username` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NULL,
  `password` VARCHAR(255) NOT NULL,
  `tokenHash` VARCHAR(255) NULL,
  PRIMARY KEY (`idUser`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`user_profile`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`user_profile` (
  `idUserFK` INT NOT NULL,
  `avatar` VARCHAR(255) NULL DEFAULT "NONE",
  `firstName` VARCHAR(255) NULL DEFAULT "NONE",
  `lastName` VARCHAR(255) NULL DEFAULT "NONE",
  `location_country` INT NULL,
  `location_city` INT NULL,
  `address` VARCHAR(255) NULL DEFAULT "NONE",
  `bio` TEXT(300) NULL,
  `categ_profiling` TEXT(300) NULL,
  `verification_email` BOOLEAN NOT NULL DEFAULT 0,
  PRIMARY KEY (`idUserFK`),
  INDEX `fk_idUserFK_user_user_profile_index` (`idUserFK` ASC),
  CONSTRAINT `fk_idUserFK_user_user_profile`
	FOREIGN KEY (`idUserFK`)
    REFERENCES `zimacess_zimatdb`.`user` (`idUser`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
CONSTRAINT `fk_location_country_user_profile`
	FOREIGN KEY (`location_country`)
    REFERENCES `zimacess_zimatdb`.`country` (`idCountry`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION,
CONSTRAINT `fk_location_city_user_profile`
	FOREIGN KEY (`location_city`)
    REFERENCES `zimacess_zimatdb`.`cities` (`idCity`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`user_socials`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`user_socials` (
  `idUserFK` INT NOT NULL,
  `facebook` VARCHAR(255) NULL DEFAULT "NONE",
  `instagram` VARCHAR(255) NULL DEFAULT "NONE",
  `twitter` VARCHAR(255) NULL DEFAULT "NONE",
  `vk` VARCHAR(255) NULL DEFAULT "NONE",
  `whatsApp` VARCHAR(255) NULL DEFAULT "NONE",
  PRIMARY KEY (`idUserFK`),
  INDEX `fk_idUserFK_user_user_socials_index` (`idUserFK` ASC),
  CONSTRAINT `fk_idUserFK_user_user_socials`
	FOREIGN KEY (`idUserFK`)
    REFERENCES `zimacess_zimatdb`.`user` (`idUser`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`verification_code`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`verification_code` (
  `idVc` INT NOT NULL auto_increment,
  `idUserFK` INT NOT NULL,
  `code` VARCHAR(255) NULL,
  `type` VARCHAR(255) NULL,
  PRIMARY KEY (`idVc`),
    INDEX `fk_idUserFK_user_verification_code_index` (`idUserFK` ASC),
  CONSTRAINT `fk_idUserFK_user_verification_code`
	FOREIGN KEY (`idUserFK`)
    REFERENCES `zimacess_zimatdb`.`user` (`idUser`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`user_support`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`user_support` (
  `idIssue` INT NOT NULL auto_increment,
  `email` VARCHAR(255) NOT NULL,
  `issue` TEXT(500) NULL,
  `support_type` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`idIssue`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`user_ambassador`
-- -----------------------------------------------------
-- DROP TABLE `zimacess_zimatdb`.`user_ambassador`;
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`user_ambassador` (
  `idUserFK` INT NOT NULL,
  `idAmbassadorFK` INT NOT NULL,
  `stake` DECIMAL(2,1) DEFAULT 0.0,
  `supportStake` DECIMAL(2,1) DEFAULT 0.0,
  PRIMARY KEY (`idUserFK`),
  INDEX `fk_idUserFK_user_user_ambassador_index` (`idUserFK` ASC),
  CONSTRAINT `fk_idUserFK_user_user_ambassador`
	FOREIGN KEY (`idUserFK`)
    REFERENCES `zimacess_zimatdb`.`user` (`idUser`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_idAmbassadorFK_user_user_ambassador`
	FOREIGN KEY (`idAmbassadorFK`)
    REFERENCES `zimacess_zimatdb`.`user` (`idUser`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- SECTION FOR EVENT TABLES ###Last add 13.04.2022
-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`category`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`category` (
  `idCategory` INT NOT NULL auto_increment,
  `title` VARCHAR(255),
  PRIMARY KEY (`idCategory`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`user_verified`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`user_verified` (
  `idUserFK` INT NOT NULL auto_increment,
  `doc` VARCHAR(255) NULL,
  `verified` INT DEFAULT 0,
  PRIMARY KEY (`idUserFK`),
   INDEX `index_user_verified_From_origin` (`idUserFK` ASC),
  CONSTRAINT `fk_idUserFK_idUser_user_verified`
    FOREIGN KEY (`idUserFK`)
    REFERENCES `zimacess_zimatdb`.`user` (`idUser`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`event`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`event` (
  `idEvent` INT NOT NULL auto_increment,
  `title` VARCHAR(255) NULL,
  `postMessage` VARCHAR(255),
  `description` TEXT(300) NULL,
  `location_country` INT NULL,
  `location_city` INT NULL,
  `location` VARCHAR(255),
  `dateTime` DATETIME NOT NULL,
  `event_GMT` INT NULL,
  `status` VARCHAR(255) NULL, /*OUTDATED, SCHEDULED, RESCHEDULED, ONGOING*/
  `directorFK` INT NOT NULL,
  `postDateTime` DATETIME NOT NULL,
  PRIMARY KEY (`idEvent`),
  INDEX `index_idEvent_From_origin` (`idEvent` ASC),
  CONSTRAINT `fk_directorFK_idUser`
    FOREIGN KEY (`directorFK`)
    REFERENCES `zimacess_zimatdb`.`user` (`idUser`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
    CONSTRAINT `fk_location_country_idCountry`
    FOREIGN KEY (`location_country`)
    REFERENCES `zimacess_zimatdb`.`country` (`idCountry`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION,
    CONSTRAINT `fk_location_city_idCity`
    FOREIGN KEY (`location_city`)
    REFERENCES `zimacess_zimatdb`.`cities` (`idCity`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION,
    CONSTRAINT `fk_event_timezone_event`
    FOREIGN KEY (`event_GMT`)
    REFERENCES `zimacess_zimatdb`.`world_timezone` (`idWTimezone`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`event_poster`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`event_poster` (
  `idPoster` INT NOT NULL auto_increment,
  `linkToPoster` VARCHAR(255) NULL,
  `dateUploaded` DATETIME NULL,
  `idEventFK` INT NOT NULL,
  PRIMARY KEY (`idPoster`),
  INDEX `index_idPoster_From_origin` (`idPoster` ASC),
  CONSTRAINT `fk_idEventFK_idEvent_eventPoster`
    FOREIGN KEY (`idEventFK`)
    REFERENCES `zimacess_zimatdb`.`event` (`idEvent`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`event_pricing`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`event_pricing` (
  `idPrice` INT NOT NULL auto_increment,
  `price` DECIMAL(11,2) DEFAULT 000000000.00,
  `currency` VARCHAR(255) NULL,
  `onlinePayment` BOOLEAN DEFAULT 0,
  `offlinePayment` BOOLEAN DEFAULT 0,
  `latestUpdate` DATETIME NULL,
  `idEventFK` INT NOT NULL,
  PRIMARY KEY (`idPrice`),
  INDEX `index_idPrice_From_origin` (`idPrice` ASC),
  CONSTRAINT `fk_idEventFK_idEvent_eventPricing`
    FOREIGN KEY (`idEventFK`)
    REFERENCES `zimacess_zimatdb`.`event` (`idEvent`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`event_categ`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`event_categ` (
  `idCategFK` INT NOT NULL,
  `idEventFK` INT NOT NULL,
  `hashtag` TEXT(300) NULL,
  PRIMARY KEY (`idCategFK`, `idEventFK`),
  INDEX `index_idEventFK_From_idEvent` (`idEventFK` ASC),
   CONSTRAINT `fk_idCategFK_idCateg_eventCateg`
    FOREIGN KEY (`idCategFK`)
    REFERENCES `zimacess_zimatdb`.`category` (`idCategory`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_idEventFK_idEvent_eventCateg`
    FOREIGN KEY (`idEventFK`)
    REFERENCES `zimacess_zimatdb`.`event` (`idEvent`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`event_agent`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`event_agent` (
  `idAgentFK` INT NOT NULL,
  `idEventFK` INT NOT NULL,
  `sellingRight` BOOLEAN DEFAULT 0,
  `scanningRight` BOOLEAN DEFAULT 0,
  PRIMARY KEY (`idAgentFK`, `idEventFK`),
  INDEX `index_idAgentFK_From_origin` (`idAgentFK` ASC),
   CONSTRAINT `fk_idAgentFK_idUser_eventAgent`
    FOREIGN KEY (`idAgentFK`)
    REFERENCES `zimacess_zimatdb`.`user` (`idUser`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_idEventFK_idEvent_eventAgent`
    FOREIGN KEY (`idEventFK`)
    REFERENCES `zimacess_zimatdb`.`event` (`idEvent`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`event_ticket`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`event_ticket` (
  `idTicket` INT NOT NULL auto_increment,
  `ticketHash` VARCHAR(255) NULL,
  `sold` BOOLEAN DEFAULT 0,
  `idEventFK` INT NOT NULL,
  PRIMARY KEY (`idTicket`),
 INDEX `index_idTicket_From_origin` (`idTicket` ASC),
  CONSTRAINT `fk_idEventFK_idEvent_eventTicket`
    FOREIGN KEY (`idEventFK`)
    REFERENCES `zimacess_zimatdb`.`event` (`idEvent`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`ticket_order`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`ticket_order` (
  `idTicketFK` INT NOT NULL unique,
  `idCustomerFK` INT NULL,
  `securityCode` VARCHAR(255) NULL,
  `idPriceFK` INT NOT NULL,
  `commission` DECIMAL(11,2) DEFAULT 000000000.00,
  `orderDate` DATETIME,
  `scanned` BOOLEAN DEFAULT 0,
  `whoFK` INT NULL,
  `when` DATETIME NULL,
  `idAgentFK` INT NULL,
  PRIMARY KEY (`idTicketFK`),
  INDEX `index_idTicketFK_From_idTicket` (`idTicketFK` ASC),
  CONSTRAINT `fk_idTicketFK_idTicket_TicketOrder`
    FOREIGN KEY (`idTicketFK`)
    REFERENCES `zimacess_zimatdb`.`event_ticket` (`idTicket`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
    CONSTRAINT `fk_idCustomerFK_idUser_TicketOrder`
    FOREIGN KEY (`idCustomerFK`)
    REFERENCES `zimacess_zimatdb`.`user` (`idUser`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION,
    CONSTRAINT `fk_idPriceFK_idPrice_TicketOrder`
    FOREIGN KEY (`idPriceFK`)
    REFERENCES `zimacess_zimatdb`.`event_pricing` (`idPrice`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
	CONSTRAINT `fk_idAgentFK_idAgent_TicketOrder`
    FOREIGN KEY (`idAgentFK`)
    REFERENCES `zimacess_zimatdb`.`event_agent` (`idAgentFK`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION,
    CONSTRAINT `fk_whoFK_idUser_TicketOrder`
    FOREIGN KEY (`whoFK`)
    REFERENCES `zimacess_zimatdb`.`event_agent` (`idAgentFK`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`event_ticket_counter`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`event_ticket_counter` (
  `idEventFK` INT NOT NULL,
  `totalTicket` INT NULL DEFAULT 0,
  `qtSold` INT NULL DEFAULT 0,
  `totalTicketOrigin` INT NULL DEFAULT 0,
  `webScanner` VARCHAR(255) NOT NULL DEFAULT "TURN_OFF", /*TURN_OFF, TURN_ON*/
  `serviceFee` VARCHAR(255) NOT NULL DEFAULT "UNPAID", /*UNPAID, PAID*/
  PRIMARY KEY (`idEventFK`),
  INDEX `index_idEventFK_From_idEvent` (`idEventFK` ASC),
  CONSTRAINT `fk_idEventFK_idEvent_eventTicketCounter`
    FOREIGN KEY (`idEventFK`)
    REFERENCES `zimacess_zimatdb`.`event` (`idEvent`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`ambassador_dividend`
-- -----------------------------------------------------
 -- DROP TABLE `zimacess_zimatdb`.`ambassador_dividend`;
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`ambassador_dividend` (
  `idDividend` INT NOT NULL auto_increment,
  `idEventFK` INT NOT NULL,
  `idAmbassadorFK` INT NOT NULL,
  `dividend` DECIMAL(11,2) DEFAULT 000000000.00,
  `supportFees` DECIMAL(11,2) DEFAULT 000000000.00,
  PRIMARY KEY (`idDividend`),
  INDEX `fk_idDividend_ambassador_dividend_index` (`idDividend` ASC),
  CONSTRAINT `fk_idEventFK_event_ambassador_dividend`
	FOREIGN KEY (`idEventFK`)
    REFERENCES `zimacess_zimatdb`.`event` (`idEvent`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_idAmbassadorFK_user_ambassador_dividend`
	FOREIGN KEY (`idAmbassadorFK`)
    REFERENCES `zimacess_zimatdb`.`user` (`idUser`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`user_follower`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`user_follower` (
  `idUserFK` INT NOT NULL,
  `idFollowerFK` INT NOT NULL,
  `followDate` DATETIME,
  PRIMARY KEY (`idUserFK`,`idFollowerFK`),
  INDEX `index_idUserFK_From_user_follower` (`idUserFK` ASC),
  CONSTRAINT `fk_idUserFK_idUser_user_follower`
    FOREIGN KEY (`idUserFK`)
    REFERENCES `zimacess_zimatdb`.`user` (`idUser`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
     CONSTRAINT `fk_idUserFK_idFollowerFK_user_follower`
    FOREIGN KEY (`idFollowerFK`)
    REFERENCES `zimacess_zimatdb`.`user` (`idUser`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `zimacess_zimatdb`.`event_like`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zimacess_zimatdb`.`event_like` (
  `idEventFK` INT NOT NULL,
  `idLikerFK` INT NOT NULL,
  `likeDate` DATETIME,
  PRIMARY KEY (`idEventFK`,`idLikerFK`),
  INDEX `index_idEventFK_From_event_like` (`idEventFK` ASC),
  CONSTRAINT `fk_idEventFK_idEvent_event_like`
    FOREIGN KEY (`idEventFK`)
    REFERENCES `zimacess_zimatdb`.`event` (`idEvent`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
     CONSTRAINT `fk_idLikerFK_idEventFK_event_like`
    FOREIGN KEY (`idLikerFK`)
    REFERENCES `zimacess_zimatdb`.`user` (`idUser`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- TRIGGERS SECTION
-- DROP TRIGGER `INSERT_AMBASSADOR_DIVIDENT_ROW`;
DROP TRIGGER IF EXISTS `INSERT_AMBASSADOR_DIVIDENT_ROW`;
DELIMITER //
CREATE TRIGGER `INSERT_AMBASSADOR_DIVIDENT_ROW`
AFTER UPDATE ON `zimacess_zimatdb`.`event_ticket_counter`
FOR EACH ROW
BEGIN
IF new.serviceFee="PAID" THEN
INSERT INTO `zimacess_zimatdb`.`ambassador_dividend` (`idEventFK`, `idAmbassadorFK`, `dividend`, `supportFees`) VALUES (new.idEventFK, (SELECT `idAmbassadorFK` FROM `user_ambassador` WHERE `user_ambassador`.`idUserFK` =(SELECT `directorFK` FROM `event` WHERE `idEvent`=new.idEventFK)),((SELECT SUM(commission) FROM `ticket_order` INNER JOIN `event_ticket` ON `ticket_order`.`idTicketFK` = `event_ticket`.`idTicket` WHERE `event_ticket`.`idEventFK` = new.idEventFK)*(SELECT `stake` FROM `user_ambassador` WHERE `idUserFK` =(SELECT `directorFK` FROM `event` WHERE `idEvent`=new.idEventFK))), (((SELECT SUM(commission) FROM `ticket_order` INNER JOIN `event_ticket` ON `ticket_order`.`idTicketFK` = `event_ticket`.`idTicket` WHERE `event_ticket`.`idEventFK` = new.idEventFK)*(SELECT `stake` FROM `user_ambassador` WHERE `idUserFK` =(SELECT `directorFK` FROM `event` WHERE `idEvent`=new.idEventFK)))*(SELECT `supportStake` FROM `user_ambassador` WHERE `idUserFK` =(SELECT `directorFK` FROM `event` WHERE `idEvent`=new.idEventFK))));
-- ELSE
-- UPDATE `jpdb`.`Podcaster`
-- SET `totalFollowers`=`totalFollowers`+1
-- WHERE `Podcaster`.`userIduserFK`=new.userIduserFK;
END IF;
END;// 


-- DEFAULT INSERT QUERIES INTO OUR DATABASE
-- insert default categories
/*INSERT INTO `zimacess_zimatdb`.`category` (`title`) VALUES
("Education"),("Sport"),("Entertainment"),("Politics"),("Healthcare");

-- insert default curencies
INSERT INTO `zimacess_zimatdb`.`currency`(`currencyCode`, `currencyName`) VALUES
("Rubles","Russian Rouble"),("Gourdes","Haitian Gourde"),("USD","Dollar americain");

-- insert default countries
INSERT INTO `zimacess_zimatdb`.`country` (`name`, `idCurrencyFK`, `language`, `isFederation`) VALUES
("Haiti",(SELECT `currency`.`idCurrency` FROM `currency` WHERE `currency`.`currencyCode`="Gourdes"),"French", 0),
("Russia",(SELECT `currency`.`idCurrency` FROM `currency` WHERE `currency`.`currencyCode`="Rubles"),"Russian", 1),
("USA",(SELECT `currency`.`idCurrency` FROM `currency` WHERE `currency`.`currencyCode`="USD"),"English", 1);

-- insert default cities
INSERT INTO `zimacess_zimatdb`.`cities` (`name`, `idCountryFK`) VALUES
("Cayes", (SELECT `country`.`idCountry` FROM `country` WHERE `country`.`name` ="Haiti")),
("Camp-Perrin", (SELECT `country`.`idCountry` FROM `country` WHERE `country`.`name` ="Haiti")),
("Port-au-Prince", (SELECT `country`.`idCountry` FROM `country` WHERE `country`.`name` ="Haiti")),
("Jacmel", (SELECT `country`.`idCountry` FROM `country` WHERE `country`.`name` ="Haiti")),
("Cap-Haitien", (SELECT `country`.`idCountry` FROM `country` WHERE `country`.`name` ="Haiti")),
("Jeremie", (SELECT `country`.`idCountry` FROM `country` WHERE `country`.`name` ="Haiti")),
("Oryol", (SELECT `country`.`idCountry` FROM `country` WHERE `country`.`name` ="Russia")),
("Moscow", (SELECT `country`.`idCountry` FROM `country` WHERE `country`.`name` ="Russia"));

-- insert default timezones
INSERT INTO `zimacess_zimatdb`.`world_timezone`(`GMT`) VALUES
("GMT-4"),("GMT+3"),("GMT+9"),("GMT-7"),("GMT-10");

-- insert default country timezone
  INSERT INTO `zimacess_zimatdb`.`country_timezone` (`idCountryFK`, `idWTimezoneFK`) VALUES
  (1,1), (2,2), (2,3), (3,4), (3,5);*/