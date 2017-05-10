<?php

namespace Xcms\Base\Http\Controllers;

class DashboardController extends SystemController
{
    public function index()
    {
        $this->setPageTitle('后台首页');
        menu()->setActiveItem('dashboard');
        return view('base::dashboard');
    }
}
