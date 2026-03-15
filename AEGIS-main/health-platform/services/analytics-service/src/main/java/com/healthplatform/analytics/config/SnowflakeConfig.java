package com.healthplatform.analytics.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

@Configuration
public class SnowflakeConfig {

    @Value("${snowflake.url}")
    private String url;

    @Value("${snowflake.user}")
    private String user;

    @Value("${snowflake.password}")
    private String password;

    @Value("${snowflake.account}")
    private String account;

    @Value("${snowflake.warehouse}")
    private String warehouse;

    @Value("${snowflake.database}")
    private String database;

    @Value("${snowflake.schema}")
    private String schema;

    @Bean
    public Properties snowflakeProperties() {
        Properties properties = new Properties();
        properties.put("user", user);
        properties.put("password", password);
        properties.put("account", account);
        properties.put("warehouse", warehouse);
        properties.put("db", database);
        properties.put("schema", schema);
        return properties;
    }

    public Connection getSnowflakeConnection() throws SQLException {
        return DriverManager.getConnection(url, snowflakeProperties());
    }
}
