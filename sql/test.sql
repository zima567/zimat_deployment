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