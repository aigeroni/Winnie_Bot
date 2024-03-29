# `Winnie_Bot` Privacy Policy

The `Winnie_Bot` Privacy Policy is licensed under the [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) license.

This privacy policy outlines the ways in which we store and use your data, how to get a copy of all of the data that we store, and how to request that we delete your data.

## Table of Contents

* [What we do store](#what-we-do-store)
* [What we don't store](#what-we-dont-store)
* [Who has access](#who-has-access)
* [What we use it for](#what-we-use-it-for)
* [Where we store/process it](#where-we-storeprocess-it)
* [Data exports and access](#data-exports-and-access)
* [Data deletion](#data-deletion)

## What we do store

We only store data that you give us by interacting with `Winnie_Bot`.

When you change your user configuration, set a goal, join a challenge, or create a project using Winnie, we create a record for you based on your Discord snowflake identifier (a 17-19 digit ID that Discord uses internally).  If you set a timezone using the `/config timezone` commands, or a home server using the `/config server` commands, we store this data in your user record.

We store a complete history of goals that you've set and projects that you've created using Winnie.  This includes creation date, type, duration, progress, and expected or actual completion time.  We also store a complete history of challenges that you've joined.  This includes the challenge that you joined, when you joined it, and the total that you posted or the time that you finished the challenge.

## What we don't store

We don't read your Discord messages; all interactions with Winnie are via slash command.  We don't store your username, your server nickname, your tag, your avatar, or any other information related to your Discord profile.  We also don't store your server name, icon, banner, or any other information related to your server profile.  When we need to use this information in messages, we get it directly from Discord.

If the server that you use Winnie from sets a server timezone, and you don't, then we don't store timezone data for you.  We only store it for the server.

## Who has access

Access to Winnie's database is tightly restricted.  When you run a command, Winnie only accesses the sections of the database that she needs to complete that command.  Otherwise, access is limited to members of the core team, who use an external tool hosted by a core team member to query the database.  We do not sell your data, nor do we give it to anyone who is not directly involved with the development of Winnie.

Your server's name may be visible to users in other servers through the raptor leaderboard and cross-server summaries at the end of challenges.

## What we use it for

Winnie uses the data in her database to provide you with access to her features.  The core team uses the database to check for inappropriate challenge names.  We also analyse the data in the database to understand the ways that people use Winnie, which helps us to decide which new features to prioritise.

## Where we store/process it

Winnie's database is hosted on a server in The Netherlands.  The external tool that the core team uses to access Winnie is hosted on a server in the United States of America.  The core team processes data on our local machines in Australia and the United States of America.

## Data exports and access

You can request all of the data that we store about you by sending an email to `info at winniebot dot org` with your Discord account's snowflake identifier.  Follow [these instructions](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-) to get your snowflake.

In future, we plan to allow you to automatically export your challenge, goal, and project history to the `.csv` format, for download onto your own machine.

## Data deletion

If you wish to request deletion of your user data on the public Winnie_Bot instance, please contact `info at winniebot dot org` with your Discord account's snowflake identifier.  Follow [these instructions](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-) to get your snowflake.

Our standard procedure for deleting user data is to delete your user record, goals, and projects entirely, and anonymise all raptor and challenge data by replacing your snowflake with a nonsense string.  This permanently deletes all data that could be used to get your Discord profile or calculate your timezone, while preserving raptor and challenge statistics.  If this is not sufficient, please let us know in the email and we'll work with you to find an amicable resolution.

[Back to README](./README.md)
