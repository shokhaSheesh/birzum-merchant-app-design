import { createBrowserRouter } from 'react-router-dom'
import { ApplicationDetailPage } from '@/features/applications/pages/ApplicationDetailPage'
import { ApplicationsPage } from '@/features/applications/pages/ApplicationsPage'
import { ChangePasswordPage } from '@/features/auth/pages/ChangePasswordPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { ConfirmLoginPage } from '@/features/auth/pages/ConfirmLoginPage'
import { CalculatorPage } from '@/features/calculator/pages/CalculatorPage'
import { AddCardPage } from '@/features/clients/pages/AddCardPage'
import { ClientDetailPage } from '@/features/clients/pages/ClientDetailPage'
import { ClientsPage } from '@/features/clients/pages/ClientsPage'
import { NewClientPage } from '@/features/clients/pages/NewClientPage'
import { ScanClientPage } from '@/features/clients/pages/ScanClientPage'
import { NewContractPage } from '@/features/clients/pages/NewContractPage'
import { CustomerCardsPage } from '@/features/customer-app/pages/CustomerCardsPage'
import { CustomerAddCardPage } from '@/features/customer-app/pages/CustomerAddCardPage'
import { CustomerProfilePage } from '@/features/customer-app/pages/CustomerProfilePage'
import { MyQrPage } from '@/features/customer-app/pages/MyQrPage'
import { FavoritesPage } from '@/features/customer-app/pages/FavoritesPage'
import { CartPage } from '@/features/customer-app/pages/CartPage'
import { CheckoutPage } from '@/features/customer-app/pages/CheckoutPage'
import { CategoriesPage } from '@/features/customer-app/pages/CategoriesPage'
import { SubcategoriesPage } from '@/features/customer-app/pages/SubcategoriesPage'
import { CustomerNotificationsPage } from '@/features/customer-app/pages/CustomerNotificationsPage'
import { CustomerHomePage } from '@/features/customer-app/pages/CustomerHomePage'
import { ProductPage } from '@/features/customer-app/pages/ProductPage'
import { ProductsPage } from '@/features/customer-app/pages/ProductsPage'
import { PaymentHistoryPage } from '@/features/customer-app/pages/PaymentHistoryPage'
import { SecurityPage } from '@/features/customer-app/pages/SecurityPage'
import { ChatPage } from '@/features/customer-app/pages/ChatPage'
import { PaymentsPage } from '@/features/customer-app/pages/PaymentsPage'
import { ScoringPage } from '@/features/customer-app/pages/ScoringPage'
import { SupportPage } from '@/features/customer-app/pages/SupportPage'
import { PersonalPage } from '@/features/customer-app/pages/PersonalPage'
import { ChangePhonePage } from '@/features/customer-app/pages/ChangePhonePage'
import { PurchasePage } from '@/features/customer-app/pages/PurchasePage'
import { PurchasesPage } from '@/features/customer-app/pages/PurchasesPage'
import { SearchPage } from '@/features/customer-app/pages/SearchPage'
import { StorePage } from '@/features/customer-app/pages/StorePage'
import { StoresPage } from '@/features/customer-app/pages/StoresPage'
import { CustomerAuthPage } from '@/features/customer-auth/pages/CustomerAuthPage'
import { OnboardingPage } from '@/features/customer-auth/pages/OnboardingPage'
import { PinSetupPage } from '@/features/customer-auth/pages/PinSetupPage'
import { HomePage } from '@/features/home/pages/HomePage'
import { KitPage } from '@/features/kit/pages/KitPage'
import { AttributeFormPage } from '@/features/manage/pages/AttributeFormPage'
import { AttributesPage } from '@/features/manage/pages/AttributesPage'
import { InventoryPage } from '@/features/manage/pages/InventoryPage'
import { LocationFormPage } from '@/features/manage/pages/LocationFormPage'
import { LocationsPage } from '@/features/manage/pages/LocationsPage'
import { ProductFormPage } from '@/features/manage/pages/ProductFormPage'
import { ProductsPage as ManageProductsPage } from '@/features/manage/pages/ProductsPage'
import { ReviewsPage } from '@/features/manage/pages/ReviewsPage'
import { RoleFormPage } from '@/features/manage/pages/RoleFormPage'
import { RolesPage } from '@/features/manage/pages/RolesPage'
import { StaffFormPage } from '@/features/manage/pages/StaffFormPage'
import { StaffPage } from '@/features/manage/pages/StaffPage'
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage'
import { NotFoundPage, StateDemoPage } from '@/features/states/pages/StateDemoPage'
import { StatesPage } from '@/features/states/pages/StatesPage'
import { LanguagePage } from '@/features/settings/pages/LanguagePage'
import { ThemePage } from '@/features/settings/pages/ThemePage'
import { SettlementsPage } from '@/features/settlements/pages/SettlementsPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { ROUTES } from '@/shared/config/routes'
import { DeviceLayout } from './layouts/DeviceLayout'
import { TabLayout } from './layouts/TabLayout'
import { CustomerTabLayout } from './layouts/CustomerTabLayout'
import { merchantTabs } from './tabs'

export const router = createBrowserRouter([
  {
    element: <DeviceLayout />,
    children: [
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.changePassword, element: <ChangePasswordPage /> },
      { path: ROUTES.confirmLogin, element: <ConfirmLoginPage /> },
      { path: ROUTES.kit, element: <KitPage /> },
      { path: ROUTES.theme, element: <ThemePage /> },
      { path: ROUTES.language, element: <LanguagePage /> },
      { path: ROUTES.customerLanguage, element: <LanguagePage /> },
      { path: ROUTES.customerTheme, element: <ThemePage /> },
      { path: ROUTES.states, element: <StatesPage /> },
      { path: ROUTES.stateDemo, element: <StateDemoPage /> },
      { path: ROUTES.newClient, element: <NewClientPage /> },
      { path: ROUTES.scanClient, element: <ScanClientPage /> },
      { path: ROUTES.clientDetail, element: <ClientDetailPage /> },
      { path: ROUTES.clientAddCard, element: <AddCardPage /> },
      { path: ROUTES.clientContract, element: <NewContractPage /> },
      { path: ROUTES.applicationDetail, element: <ApplicationDetailPage /> },
      { path: ROUTES.notifications, element: <NotificationsPage /> },
      { path: ROUTES.manageProducts, element: <ManageProductsPage /> },
      { path: ROUTES.manageProduct, element: <ProductFormPage /> },
      { path: ROUTES.manageInventory, element: <InventoryPage /> },
      { path: ROUTES.manageAttributes, element: <AttributesPage /> },
      { path: ROUTES.manageAttribute, element: <AttributeFormPage /> },
      { path: ROUTES.manageLocations, element: <LocationsPage /> },
      { path: ROUTES.manageLocation, element: <LocationFormPage /> },
      { path: ROUTES.manageStaff, element: <StaffPage /> },
      { path: ROUTES.manageStaffMember, element: <StaffFormPage /> },
      { path: ROUTES.manageReviews, element: <ReviewsPage /> },
      { path: ROUTES.settlements, element: <SettlementsPage /> },
      { path: ROUTES.manageRoles, element: <RolesPage /> },
      { path: ROUTES.manageRole, element: <RoleFormPage /> },
      { path: ROUTES.customerApp, element: <CustomerAuthPage /> },
      { path: ROUTES.customerPinSetup, element: <PinSetupPage /> },
      { path: ROUTES.customerSecurity, element: <SecurityPage /> },
      { path: ROUTES.customerPersonal, element: <PersonalPage /> },
      { path: ROUTES.customerChangePhone, element: <ChangePhonePage /> },
      { path: ROUTES.customerWelcome, element: <OnboardingPage /> },
      {
        element: <CustomerTabLayout />,
        children: [
          { path: ROUTES.customerHome, element: <CustomerHomePage /> },
          { path: ROUTES.customerStores, element: <StoresPage /> },
          { path: ROUTES.customerCart, element: <CartPage /> },
          { path: ROUTES.customerPurchases, element: <PurchasesPage /> },
          { path: ROUTES.customerProfile, element: <CustomerProfilePage /> },
        ],
      },
      { path: ROUTES.customerProduct, element: <ProductPage /> },
      { path: ROUTES.customerCheckout, element: <CheckoutPage /> },
      { path: ROUTES.customerPayments, element: <PaymentsPage /> },
      { path: ROUTES.customerPaymentHistory, element: <PaymentHistoryPage /> },
      { path: ROUTES.customerScoring, element: <ScoringPage /> },
      { path: ROUTES.customerSupport, element: <SupportPage /> },
      { path: ROUTES.customerChat, element: <ChatPage /> },
      { path: ROUTES.customerPurchase, element: <PurchasePage /> },
      { path: ROUTES.customerCards, element: <CustomerCardsPage /> },
      { path: ROUTES.customerQr, element: <MyQrPage /> },
      { path: ROUTES.customerAddCard, element: <CustomerAddCardPage /> },
      { path: ROUTES.customerStore, element: <StorePage /> },
      { path: ROUTES.customerSearch, element: <SearchPage /> },
      { path: ROUTES.customerCategories, element: <CategoriesPage /> },
      { path: ROUTES.customerCategory, element: <SubcategoriesPage /> },
      { path: ROUTES.customerProducts, element: <ProductsPage /> },
      { path: ROUTES.customerNotifications, element: <CustomerNotificationsPage /> },
      { path: ROUTES.customerFavorites, element: <FavoritesPage /> },
      {
        element: <TabLayout tabs={merchantTabs} />,
        children: [
          { path: ROUTES.home, element: <HomePage /> },
          { path: ROUTES.clients, element: <ClientsPage /> },
          { path: ROUTES.applications, element: <ApplicationsPage /> },
          { path: ROUTES.calculator, element: <CalculatorPage /> },
          { path: ROUTES.profile, element: <ProfilePage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
