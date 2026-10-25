package com.example.employeetaskmanager.util;


import com.example.employeetaskmanager.Exception.BadRequestException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;

public final class PageUtil {

    public static final int MAX_PAGE_SIZE = 50;

    private PageUtil() {
    }

    public static Pageable of(int page, int size, String sortBy, String direction,
                              Set<String> allowedSortFields) {

        if (page < 0) {
            throw new BadRequestException("Page index must not be negative");
        }
        if (size < 1) {
            throw new BadRequestException("Page size must be at least 1");
        }
        size = Math.min(size, MAX_PAGE_SIZE);   // bahut bada size maange to 50 tak seemit

        if (!allowedSortFields.contains(sortBy)) {
            throw new BadRequestException(
                    "Invalid sort field '" + sortBy + "'. Allowed: " + allowedSortFields);
        }

        Sort.Direction sortDirection;
        try {
            sortDirection = Sort.Direction.fromString(direction);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(
                    "Invalid sort direction '" + direction + "'. Use asc or desc");
        }

        Sort sort = Sort.by(sortDirection, sortBy);
        if (!sortBy.equals("id")) {
            sort = sort.and(Sort.by(Sort.Direction.ASC, "id"));   // stable order ke liye
        }

        return PageRequest.of(page, size, sort);
    }
}