package com.maviniciusdev.vesta.api.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class WebForwardController {

    // Redireciona qualquer URL que não seja da API (começando com /api)
    // e que não seja arquivo estático (não contém ponto) para o index do React.
    @RequestMapping(value = "/**/{path:[^\\.]*}")
    public String forward() {
        return "forward:/index.html";
    }
}

