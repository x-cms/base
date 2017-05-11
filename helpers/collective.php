<?php

if (!function_exists('html')) {
    function html()
    {
        return \Collective\Html\HtmlFacade::getFacadeRoot();
    }
}

if (!function_exists('form')) {
    function form()
    {
        return \Collective\Html\FormFacade::getFacadeRoot();
    }
}
