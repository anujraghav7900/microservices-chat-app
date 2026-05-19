package com.pulse.demo;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AppTest {
    @Test
    void statusReturnsReadyMessage() {
        assertEquals("Maven demo service is ready", App.status());
    }
}
