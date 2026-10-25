package com.example.employeetaskmanager.util;


import com.example.employeetaskmanager.Exception.BadRequestException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PageUtilTest {

    private static final Set<String> FIELDS = Set.of("id", "name");

    @Test
    @DisplayName("valid input builds the expected Pageable")
    void of_validInput_buildsPageable() {
        Pageable pageable = PageUtil.of(2, 5, "name", "desc", FIELDS);

        assertEquals(2, pageable.getPageNumber());
        assertEquals(5, pageable.getPageSize());
        Sort.Order order = pageable.getSort().getOrderFor("name");
        assertNotNull(order);
        assertEquals(Sort.Direction.DESC, order.getDirection());
    }

    @Test
    @DisplayName("sorting by name also sorts by id (stable order)")
    void of_sortByName_addsIdTieBreaker() {
        Pageable pageable = PageUtil.of(0, 10, "name", "asc", FIELDS);

        assertNotNull(pageable.getSort().getOrderFor("id"));
    }

    @Test
    @DisplayName("size above the maximum is capped")
    void of_hugeSize_isCapped() {
        Pageable pageable = PageUtil.of(0, 1000, "id", "asc", FIELDS);

        assertEquals(PageUtil.MAX_PAGE_SIZE, pageable.getPageSize());
    }

    @ParameterizedTest
    @ValueSource(ints = {-1, -50})
    @DisplayName("negative page is rejected")
    void of_negativePage_throws(int badPage) {
        assertThrows(BadRequestException.class,
                () -> PageUtil.of(badPage, 10, "id", "asc", FIELDS));
    }

    @Test
    void of_sizeZero_throws() {
        assertThrows(BadRequestException.class,
                () -> PageUtil.of(0, 0, "id", "asc", FIELDS));
    }

    @Test
    void of_unknownSortField_throwsWithHelpfulMessage() {
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> PageUtil.of(0, 10, "salary", "asc", FIELDS));

        assertTrue(ex.getMessage().contains("salary"));
    }

    @Test
    void of_badDirection_throws() {
        assertThrows(BadRequestException.class,
                () -> PageUtil.of(0, 10, "id", "up", FIELDS));
    }
}