import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { ExamplePromptsSection } from './components/ExamplePromptsSection';
import { WhoIsTravellingSection } from './components/GroupPlanner/WhoIsTravellingSection';
import { GroupComparisonModal } from './components/GroupPlanner/GroupComparisonModal';
import { DestinationDiscovery } from './components/DestinationDiscovery';
import { DestinationMapExplorer } from './components/DestinationMapExplorer';
import { TripVaultShowcaseSection } from './components/TripVault/TripVaultShowcaseSection';
import { PackingListShowcaseSection } from './components/PackingList/PackingListShowcaseSection';
import { VoyanSoundscapesSection } from './components/Soundtrack/VoyanSoundscapesSection';
import { PopularDestinations } from './components/PopularDestinations';
import { HowItWorks } from './components/HowItWorks';
import { TravelerTestimonials } from './components/TravelerTestimonials';
import { TestimonialProof } from './components/TestimonialProof';
import { Footer } from './components/Footer';
import { TripPlannerView } from './components/TripPlanner/TripPlannerView';
import { ShareTripModal } from './components/Modals/ShareTripModal';
import { AuthModal, AuthUser } from './components/Modals/AuthModal';
import { MyTripsModal } from './components/Modals/MyTripsModal';
import { MusicGeneratorModal } from './components/Soundtrack/MusicGeneratorModal';
import { MobileBottomNav } from './components/MobileApp/MobileBottomNav';
import { MobileHeader } from './components/MobileApp/MobileHeader';
import { MobileQuickAppsBar } from './components/MobileApp/MobileQuickAppsBar';
import { PWAInstallBanner } from './components/MobileApp/PWAInstallBanner';
import { MobileDeviceSimulator } from './components/MobileApp/MobileDeviceSimulator';
import { SOSModal } from './components/Emergency/SOSModal';
import { FloatingSOSTrigger } from './components/Emergency/FloatingSOSTrigger';
import { UPIPaymentModal, UPIPaymentDetails } from './components/Payment/UPIPaymentModal';
import { TravelDailyAppsHub } from './components/OnDemandApps/TravelDailyAppsHub';
import { SAMPLE_TRIPS, generateCustomTripPlan } from './data/sampleTrips';
import { generateGroupTailoredPlan } from './data/groupItineraries';
import { CATEGORIZED_DESTINATIONS } from './data/destinations';
import { TripPlan, Activity, DestinationItem, GroupPlanningConfig, TravellerGroupType } from './types/travel';
import { DestinationClimate, TripType } from './types/packing';
import { auth, onAuthStateChanged, signOut } from './lib/firebase';
import { sqliteStore } from './lib/sqliteStore';
import { APIProvider } from '@vis.gl/react-google-maps';

const initialLaunchTab = new URLSearchParams(window.location.search).get('tab');

export default function App() {
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  const [currentView, setCurrentView] = useState<'home' | 'planner'>(() =>
    ['planner', 'vault', 'packing'].includes(initialLaunchTab ?? '') ? 'planner' : 'home'
  );
  const [plannerSection, setPlannerSection] = useState<'itinerary' | 'vault' | 'packing' | 'budget_transit' | 'nearby'>(() => {
    if (initialLaunchTab === 'vault') return 'vault';
    if (initialLaunchTab === 'packing') return 'packing';
    return 'itinerary';
  });
  const [isMobileSimActive, setIsMobileSimActive] = useState(false);

  const [activeTripPlan, setActiveTripPlan] = useState<TripPlan>(() =>
    generateGroupTailoredPlan({
      groupType: 'seniors',
      travellersCount: 2,
      durationDays: 3,
      totalBudget: 14000,
      transportPreference: 'private_cab',
      destination: 'Ooty & Nilgiris',
    })
  );
  const [savedTrips, setSavedTrips] = useState<TripPlan[]>([
    activeTripPlan,
    SAMPLE_TRIPS['kashmir-peaceful']
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMyTripsModalOpen, setIsMyTripsModalOpen] = useState(false);
  const [isSoundscapesModalOpen, setIsSoundscapesModalOpen] = useState(false);
  const [soundscapesContextDestination, setSoundscapesContextDestination] = useState<string | undefined>();
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [isGlobalUpiModalOpen, setIsGlobalUpiModalOpen] = useState(false);
  const [isAppsHubOpen, setIsAppsHubOpen] = useState(false);

  // User auth state with Firebase Auth onAuthStateChanged listener
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('voyan_current_session');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const userObj: AuthUser = {
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Voyan Traveler',
          email: fbUser.email || '',
          groupPreference: currentUser?.groupPreference || 'seniors',
          joinedDate: 'October 2026',
          photoURL: fbUser.photoURL || undefined,
        };
        setCurrentUser(userObj);
        localStorage.setItem('voyan_current_session', JSON.stringify(userObj));
        void sqliteStore.list<TripPlan>('trips')
          .then((records) => setSavedTrips(records.map((record) => record.data)))
          .catch((error) => console.warn('Could not load saved trips from Java backend:', error));
      }
    });
    return () => unsubscribe();
  }, []);

  // Global Emergency SOS Keyboard Shortcut (Shift + S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.shiftKey &&
        (e.key === 'S' || e.key === 's') &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setIsSOSModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Google Maps Platform Demo Quota Event Listener
  useEffect(() => {
    const handleQuotaExceeded = () => {
      setQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    try {
      localStorage.removeItem('voyan_current_session');
    } catch (e) {}
    setCurrentUser(null);
    setSavedTrips([activeTripPlan, SAMPLE_TRIPS['kashmir-peaceful']]);
  };

  // Open Vault directly
  const handleOpenVault = () => {
    setPlannerSection('vault');
    setCurrentView('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Automated Packing List directly
  const handleOpenPacking = (_params?: { climate?: DestinationClimate; tripType?: TripType; days?: number; destination?: string }) => {
    setPlannerSection('packing');
    setCurrentView('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Plan trip from hero search or prompts
  const handlePlanTrip = (params: {
    query: string;
    destination?: string;
    state?: string;
    highlights?: string[];
    dates?: string;
    travellers?: number;
    budget?: number;
    interests?: string[];
    initialSection?: 'itinerary' | 'vault' | 'packing' | 'budget_transit' | 'nearby';
  }) => {
    const query = `${params.destination ?? ''} ${params.query}`.toLocaleLowerCase();
    const selectedDestination = CATEGORIZED_DESTINATIONS.find((destination) =>
      query.includes(destination.name.toLocaleLowerCase())
    );
    const destinationState = params.state ?? selectedDestination?.state;
    const destinationHighlights = params.highlights ?? selectedDestination?.highlights;
    const destinationBudget = params.budget ?? selectedDestination?.startingPrice;
    setIsGenerating(true);

    setTimeout(() => {
      const generated = generateCustomTripPlan({
        query: params.query,
        destination: params.destination,
        budgetPerPerson: destinationBudget,
        travellersCount: params.travellers,
        interests: params.interests
      });

      generated.id = `plan-${Date.now()}`;
      generated.saved = false;
      if (destinationState) {
        generated.state = destinationState;
        generated.destination = params.destination || selectedDestination?.name || destinationState;
        generated.title = `${generated.destination} Trip Plan`;
        generated.travellersCount = params.travellers ?? generated.travellersCount;
        generated.budgetPerPerson = destinationBudget ?? generated.budgetPerPerson;
        generated.budgetTotal = generated.budgetPerPerson * generated.travellersCount;
        generated.coverImage = selectedDestination
          ? selectedDestination.image
          : generated.coverImage;
        generated.overviewSummary = `A planning outline for ${generated.destination}, ${destinationState}. Review estimated costs and route ideas, then add confirmed bookings and tickets to your Trip Vault.`;
        const highlights = destinationHighlights?.filter(Boolean) ?? [];
        if (highlights.length > 0) {
          generated.days = generated.days.map((day, dayIndex) => {
            const firstHighlightIndex = (dayIndex * 2) % highlights.length;
            const suggestedPlaces = [
              highlights[firstHighlightIndex],
              highlights[(firstHighlightIndex + 1) % highlights.length],
            ].filter((place, index, all) => Boolean(place) && all.indexOf(place) === index);
            const activities: Activity[] = suggestedPlaces.map((place, placeIndex) => ({
              id: `suggested-${day.dayNumber}-${placeIndex + 1}`,
              time: placeIndex === 0 ? '10:00 AM' : '02:00 PM',
              title: place,
              description: `Suggested place to explore in ${destinationState}. Check current opening details and travel arrangements before your visit.`,
              category: 'sightseeing',
              duration: '1.5 hrs',
              costEstimate: 0,
              locationName: place,
              coordinates: { x: 35 + placeIndex * 30, y: 45 + (dayIndex % 2) * 10 },
            }));
            return {
              ...day,
              title: `Day ${day.dayNumber} in ${destinationState}`,
              theme: `Explore ${generated.destination}`,
              activities,
              diningOptions: [],
            };
          });
        }
      }

      if (params.dates) {
        const parts = params.dates.split('–').map((p) => p.trim());
        if (parts.length === 2) {
          generated.travelDates.start = parts[0];
          generated.travelDates.end = parts[1];
        }
      }

      setActiveTripPlan(generated);
      setPlannerSection(params.initialSection ?? 'itinerary');
      setIsGenerating(false);
      setCurrentView('planner');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 450);
  };

  // Group tailored plan generation
  const handleGenerateGroupPlan = (config: GroupPlanningConfig & { destination: string; dates: string }) => {
    setIsGenerating(true);

    setTimeout(() => {
      const tailoredPlan = generateGroupTailoredPlan(config);
      if (config.dates) {
        const parts = config.dates.split('–').map((p) => p.trim());
        if (parts.length === 2) {
          tailoredPlan.travelDates.start = parts[0];
          tailoredPlan.travelDates.end = parts[1];
        }
      }

      setActiveTripPlan(tailoredPlan);
      setPlannerSection('itinerary');
      setIsGenerating(false);
      setCurrentView('planner');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 450);
  };

  // Plan trip from Destination Discovery card
  const handleSelectDiscoveryDestination = (dest: DestinationItem) => {
    handlePlanTrip({
      query: dest.defaultPrompt,
      destination: dest.name,
      state: dest.state,
      highlights: dest.highlights,
      budget: dest.startingPrice,
      travellers: 2
    });
  };

  const handleOpenStateDetails = (
    destination: DestinationItem,
    section: 'budget_transit' | 'vault'
  ) => {
    handlePlanTrip({
      query: destination.defaultPrompt,
      destination: destination.name,
      state: destination.state,
      highlights: destination.highlights,
      budget: destination.startingPrice,
      travellers: 2,
      initialSection: section,
    });
  };

  // Switch group on active itinerary
  const handleChangeGroupType = (newGroup: TravellerGroupType) => {
    const updatedPlan = generateGroupTailoredPlan({
      groupType: newGroup,
      travellersCount: newGroup === 'solo' ? 1 : newGroup === 'couple' ? 2 : 4,
      durationDays: activeTripPlan.durationDays,
      totalBudget: newGroup === 'solo' ? 5000 : newGroup === 'couple' ? 15000 : 18000,
      transportPreference: newGroup === 'seniors' ? 'private_cab' : 'self_drive',
      destination: activeTripPlan.destination,
    });
    setActiveTripPlan(updatedPlan);
  };

  const handleUpdatePlan = (updated: TripPlan) => {
    setActiveTripPlan(updated);
    setSavedTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    if (savedTrips.some((trip) => trip.id === updated.id) && auth.currentUser) {
      void sqliteStore.save('trips', updated.id, updated)
        .catch((error) => console.warn('Could not update saved trip in Java backend:', error));
    }
  };

  const handleSaveTrip = (planToSave: TripPlan) => {
    const savedPlan = { ...planToSave, saved: true };
    setSavedTrips((prev) => {
      const exists = prev.some((t) => t.id === planToSave.id);
      if (exists) {
        return prev.map((t) => (t.id === planToSave.id ? savedPlan : t));
      }
      return [savedPlan, ...prev];
    });
    if (auth.currentUser) {
      void sqliteStore.save('trips', savedPlan.id, savedPlan)
        .catch((error) => console.warn('Could not save trip to Java backend:', error));
    }
  };

  const handleDeleteSavedTrip = (tripId: string) => {
    setSavedTrips((prev) => prev.filter((t) => t.id !== tripId));
    if (auth.currentUser) {
      void sqliteStore.remove('trips', tripId)
        .catch((error) => console.warn('Could not remove saved trip from Java backend:', error));
    }
  };

  const handleOpenSoundscapes = (dest?: string) => {
    setSoundscapesContextDestination(dest || activeTripPlan.destination);
    setIsSoundscapesModalOpen(true);
  };

  const isCurrentTripSaved = savedTrips.some((t) => t.id === activeTripPlan.id);

  const mainAppContent = (
    <div className="min-h-screen bg-[#FBFBFA] text-[#0F172A] font-['Plus_Jakarta_Sans',sans-serif] selection:bg-teal-100 selection:text-teal-900 flex flex-col">
      {/* Google Maps Demo Key Quota Notification Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm flex items-center justify-center gap-2">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
          <button
            onClick={() => setQuotaExceeded(false)}
            className="ml-2 text-amber-700 hover:text-amber-950 font-bold text-xs p-1 cursor-pointer"
            title="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mobile Header when in Mobile Simulator Mode */}
      {isMobileSimActive ? (
        <MobileHeader
          destinationName={activeTripPlan.destination}
          durationDays={activeTripPlan.durationDays}
          currentUser={currentUser}
          onOpenSignIn={() => setIsAuthModalOpen(true)}
          onOpenMyTrips={() => setIsMyTripsModalOpen(true)}
          onOpenSOS={() => setIsSOSModalOpen(true)}
          onOpenAppsHub={() => setIsAppsHubOpen(true)}
          onNavigateHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : (
        /* Standard Desktop Navigation with Auth profile & My Trips & Mobile Sim */
        <Navbar
          currentView={currentView}
          onNavigateHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenPlanner={() => {
            setPlannerSection('itinerary');
            setCurrentView('planner');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenVault={handleOpenVault}
          onOpenDocuments={handleOpenVault}
          onOpenUPIPay={() => setIsGlobalUpiModalOpen(true)}
          onOpenPacking={handleOpenPacking}
          onOpenMyTrips={() => setIsMyTripsModalOpen(true)}
          onOpenSignIn={() => setIsAuthModalOpen(true)}
          onOpenSoundscapes={() => handleOpenSoundscapes()}
          onOpenSOS={() => setIsSOSModalOpen(true)}
          onOpenAppsHub={() => setIsAppsHubOpen(true)}
          savedTripsCount={savedTrips.length}
          currentUser={currentUser}
          onSignOut={handleSignOut}
          onToggleMobileSim={() => setIsMobileSimActive(!isMobileSimActive)}
          isMobileSimActive={isMobileSimActive}
        />
      )}

      {/* Quick Apps Dock — always visible on all screen sizes */}
      <MobileQuickAppsBar
        destination={activeTripPlan.destination}
        onOpenFullHub={() => setIsAppsHubOpen(true)}
      />

      {/* Main View Switcher */}
      <main className="flex-1 pb-24 lg:pb-0">
        {currentView === 'home' ? (
          <>
            {/* Hero AI Travel Search */}
            <HeroSearch
              onPlanTrip={handlePlanTrip}
              isGenerating={isGenerating}
            />

            {/* Concise 3-Step "How It Works" Flow Strategically Placed to Guide Users */}
            <HowItWorks
              onSelectPrompt={handlePlanTrip}
            />

            {/* Example Search Prompts Showcase Section */}
            <ExamplePromptsSection
              onSelectPrompt={handlePlanTrip}
            />

            {/* Dedicated "Who is travelling?" Section (5 Selectable Group Cards) */}
            <WhoIsTravellingSection
              onGeneratePlan={handleGenerateGroupPlan}
              onOpenComparison={() => setIsComparisonModalOpen(true)}
            />

            {/* Automated Packing List Generator Showcase */}
            <PackingListShowcaseSection
              onOpenPackingPlanner={handleOpenPacking}
            />

            {/* Trip Vault Unified Hub Showcase: "Bookings, tickets, itineraries, expenses & memories in one place" */}
            <TripVaultShowcaseSection
              onOpenVault={handleOpenVault}
            />

            {/* Destination Discovery Section (Goa, Rajasthan, Kerala, Himachal Pradesh) */}
            <DestinationDiscovery
              onPlanDestination={handleSelectDiscoveryDestination}
            />

            {/* Interactive Google Maps Platform India Explorer */}
            {mapsApiKey ? (
              <DestinationMapExplorer onPlanDestination={handleSelectDiscoveryDestination} />
            ) : (
              <section className="border-t border-stone-200/70 bg-white py-8">
                <div className="mx-auto max-w-7xl px-4 text-sm text-stone-600 sm:px-6 lg:px-8">
                  Interactive map is unavailable until <code>VITE_GOOGLE_MAPS_API_KEY</code> is configured.
                  Browse destinations below and open each place in Google Maps.
                </div>
              </section>
            )}

            {/* Voyan Travel Soundscapes (Lyria AI Music Generation) */}
            <VoyanSoundscapesSection
              onOpenGenerator={(dest) => handleOpenSoundscapes(dest)}
            />

            {/* What Our Travelers Say Section */}
            <TravelerTestimonials />

            {/* Popular destinations across India */}
            <PopularDestinations
              onSelectDestination={handleSelectDiscoveryDestination}
              onOpenStateDetails={handleOpenStateDetails}
            />

            {/* Quantitative Proof Strip */}
            <TestimonialProof />
          </>
        ) : (
          /* Side-by-Side Interactive Travel Planning & Trip Vault & Packing List Workspace */
          <TripPlannerView
            plan={activeTripPlan}
            onUpdatePlan={handleUpdatePlan}
            onSaveTrip={handleSaveTrip}
            onShareTrip={() => setIsShareModalOpen(true)}
            onBackToHome={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenSoundscapes={handleOpenSoundscapes}
            onChangeGroupType={handleChangeGroupType}
            onOpenComparison={() => setIsComparisonModalOpen(true)}
            onSectionChange={setPlannerSection}
            isSaved={isCurrentTripSaved}
            initialSection={plannerSection}
            onOpenSOS={() => setIsSOSModalOpen(true)}
          />
        )}
      </main>

      {/* Site Footer */}
      {!isMobileSimActive && (
        <Footer
          onNavigateHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenMyTrips={() => setIsMyTripsModalOpen(true)}
          onOpenSOS={() => setIsSOSModalOpen(true)}
        />
      )}

      {/* Native Mobile Bottom Navigation Bar (Active on mobile viewports or in simulated mobile mode) */}
      <MobileBottomNav
        activeView={currentView}
        plannerSubTab={plannerSection}
        onNavigateHome={() => {
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigatePlanner={() => {
          setPlannerSection('itinerary');
          setCurrentView('planner');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateVault={handleOpenVault}
        onNavigatePacking={handleOpenPacking}
        onNavigateExpenses={() => {
          setPlannerSection('budget_transit');
          setCurrentView('planner');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAppsHub={() => setIsAppsHubOpen(true)}
        vaultItemsCount={5}
        isSimulated={isMobileSimActive}
      />

      {/* In-App PWA Install Banner & Install Modal */}
      {!isMobileSimActive && <PWAInstallBanner />}

      {/* Share Trip Modal */}
      <ShareTripModal
        plan={activeTripPlan}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Unified Auth Modal (Firebase Google + Email Sign In + Register + Forgot Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          if (user.groupPreference) {
            handleChangeGroupType(user.groupPreference);
          }
        }}
      />

      {/* My Saved Trips Modal */}
      <MyTripsModal
        isOpen={isMyTripsModalOpen}
        onClose={() => setIsMyTripsModalOpen(false)}
        savedTrips={savedTrips}
        onSelectTrip={(trip) => {
          setActiveTripPlan(trip);
          setPlannerSection('itinerary');
          setCurrentView('planner');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onDeleteTrip={handleDeleteSavedTrip}
        onStartNewPlan={() => {
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Side-by-Side Group Comparison Modal */}
      <GroupComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        destinationName={activeTripPlan.destination}
        onSelectGroupPlan={(plan) => {
          setActiveTripPlan(plan);
          setPlannerSection('itinerary');
          setCurrentView('planner');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Lyria Music Generator Modal */}
      <MusicGeneratorModal
        isOpen={isSoundscapesModalOpen}
        onClose={() => setIsSoundscapesModalOpen(false)}
        destinationContext={soundscapesContextDestination}
      />

      {/* Global Floating Emergency SOS Trigger Button */}
      <FloatingSOSTrigger
        onOpenSOS={() => setIsSOSModalOpen(true)}
        isSimulatedMobile={isMobileSimActive}
      />

      {/* Emergency SOS Hub Modal */}
      <SOSModal
        isOpen={isSOSModalOpen}
        onClose={() => setIsSOSModalOpen(false)}
        destination={activeTripPlan.destination}
      />

      {/* Global UPI Payment Modal */}
      <UPIPaymentModal
        isOpen={isGlobalUpiModalOpen}
        onClose={() => setIsGlobalUpiModalOpen(false)}
        details={{
          payeeName: `${activeTripPlan.destination} Travel Partner`,
          payeeVpa: 'voyan.travel@icici',
          amount: 1200,
          transactionNote: `Trip Payment - ${activeTripPlan.destination}`,
          tripTitle: activeTripPlan.title,
        }}
      />

      {/* On-Demand Apps Hub Modal (Rapido, Uber, Zomato, Swiggy, Meesho, Amazon, Flipkart) */}
      {isAppsHubOpen && (
        <TravelDailyAppsHub
          destination={activeTripPlan.destination}
          isOpenAsModal={true}
          onCloseModal={() => setIsAppsHubOpen(false)}
        />
      )}
    </div>
  );

  const appContent = (
    <MobileDeviceSimulator
      isMobileSimActive={isMobileSimActive}
      onToggleMobileSim={() => setIsMobileSimActive(!isMobileSimActive)}
    >
      {mainAppContent}
    </MobileDeviceSimulator>
  );

  return mapsApiKey ? (
    <APIProvider apiKey={mapsApiKey} libraries={['marker', 'routes']}>
      {appContent}
    </APIProvider>
  ) : appContent;
}
