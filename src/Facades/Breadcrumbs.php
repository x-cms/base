<?php

namespace Xcms\Base\Facades;

use Illuminate\Support\Facades\Facade;

class Breadcrumbs extends Facade
{
    /**
     * @return string
     */
    protected static function getFacadeAccessor()
    {
        return 'breadcrumbs';
    }
}
