package com.example.employeetaskmanager.specification;

public final class SpecUtil {

    private SpecUtil() {
    }

    // "ra" -> "%ra%". User ke %, _ ko normal character bana deta hai
    public static String containsPattern(String input) {
        String escaped = input.trim().toLowerCase()
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        return "%" + escaped + "%";
    }
}