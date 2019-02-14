CREATE TYPE total_types AS ENUM ('words', 'lines', 'pages', 'minutes');
CREATE TABLE goals(
	user_id     VARCHAR(30) PRIMARY KEY     NOT NULL,
	goal        INT         NOT NULL,
	goal_type   total_types NOT NULL,
	written     INT         DEFAULT 0       NOT NULL,
	start_time  TIMESTAMP WITH TIME ZONE    NOT NULL,
	end_time    TIMESTAMP WITH TIME ZONE    NOT NULL,
	channel_id  VARCHAR(20) NOT NULL
);