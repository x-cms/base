<?php

namespace Xcms\Base\Facades;

use Illuminate\Support\Facades\Facade;
use Xcms\Base\Support\Breadcrumbs;

class BreadcrumbsFacade extends Facade
{
    /**
     * @return string
     */
    protected static function getFacadeAccessor()
    {
        return Breadcrumbs::class;
    }
}
