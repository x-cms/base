<?php

namespace Xcms\Base\Http\Controllers;

class DashboardController extends SystemController
{
    public function index()
    {
        $this->setPageTitle('后台首页');
        return view('base::dashboard');
    }
}
