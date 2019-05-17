CREATE TABLE `signUp` (
    `id` varchar(20) NOT NULL,
    `password` varchar(20) NOT NULL,
    `name` varchar(20) NOT NULL,
    `birthday` varchar(20) NOT NULL,
    `sex` varchar(10) NOT NULL,
    `email` varchar(20) NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE `busking_info` (
    `user_name` varchar(20) NOT NULL,
    `board_num` INT(11) NOT NULL,
    `image` varchar(50) NOT NULL,
    `singer` varchar(10) NOT NULL,
    `song` varchar(20) NOT NULL,
    `song_list` varchar(100) NOT NULL,
    `genre` varchar(10) NOT NULL,
    `date_start` DATETIME NOT NULL,
    `date_end` DATETIME NOT NULL,
    `location` varchar(10) NOT NULL,
    `location_detail` varchar(20) NOT NULL,
    `youtube_link` varchar(1024) NOT NULL,
    PRIMARY KEY (`board_num`)
);