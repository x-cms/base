<?php namespace Xcms\Base\Providers;

use Illuminate\Foundation\AliasLoader;
use Illuminate\Support\ServiceProvider;
use Nestable\NestableServiceProvider;
use Xcms\Base\Facades\BreadcrumbsFacade;

class ModuleServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
        /*Load views*/
        $this->loadViewsFrom(__DIR__ . '/../../resources/views', 'base');
        /*Load translations*/
        $this->loadTranslationsFrom(__DIR__ . '/../../resources/lang', 'base');
        /*Load migrations*/
        $this->loadMigrationsFrom(__DIR__ . '/../../database/migrations');

        $this->publishes([
            __DIR__ . '/../../config' => base_path('config'),
        ], 'config');
        $this->publishes([
            __DIR__ . '/../../resources/assets' => resource_path('assets'),
            __DIR__ . '/../../resources/public' => public_path('vendor/core'),
        ], 'assets');
        $this->publishes([
            __DIR__ . '/../../resources/views' => config('view.paths')[0] . '/vendor/base',
        ], 'views');
        $this->publishes([
            __DIR__ . '/../../resources/lang' => base_path('resources/lang/vendor/base'),
        ], 'lang');
        $this->publishes([
            __DIR__ . '/../../database' => base_path('database'),
        ], 'migrations');
    }

    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {
        //Load helpers
        $this->loadHelpers();

        /**
         * Base providers
         */
        $this->app->register(CollectiveServiceProvider::class);
        $this->app->register(RouteServiceProvider::class);
        $this->app->register(ComposerServiceProvider::class);

        /**
         * Other packages
         */
        $this->app->register(\Yajra\Datatables\DatatablesServiceProvider::class);
        $this->app->register(\Collective\Html\HtmlServiceProvider::class);
        $this->app->register(NestableServiceProvider::class);

        /**
         * Other module providers
         */
        $this->app->register(\Xcms\Acl\Providers\ModuleServiceProvider::class);
        $this->app->register(\Xcms\Menu\Providers\ModuleServiceProvider::class);
        $this->app->register(\Xcms\Blog\Providers\ModuleServiceProvider::class);
        $this->app->register(\Xcms\Page\Providers\ModuleServiceProvider::class);
        $this->app->register(\Xcms\Plugin\Providers\ModuleServiceProvider::class);

        //Register related facades
        $loader = AliasLoader::getInstance();
        $loader->alias('Breadcrumbs', BreadcrumbsFacade::class);
        $loader->alias('Form', \Collective\Html\FormFacade::class);
        $loader->alias('Html', \Collective\Html\HtmlFacade::class);
        $loader->alias('Nestable', \Nestable\Facades\NestableService::class);

    }

    protected function loadHelpers()
    {
        $helpers = $this->app['files']->glob(__DIR__ . '/../../helpers/*.php');
        foreach ($helpers as $helper) {
            require_once $helper;
        }
    }
}
