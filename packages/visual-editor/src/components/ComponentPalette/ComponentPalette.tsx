import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useDrag } from 'react-dnd';

const PaletteContainer = styled.div`
  width: 300px;
  background: #ffffff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PaletteHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  overflow-x: auto;
`;

const CategoryTab = styled.button<{ $active: boolean }>`
  padding: 12px 16px;
  border: none;
  background: ${props => props.$active ? '#3498db' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#666'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? '#3498db' : '#e9ecef'};
  }
`;

const ComponentList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const ComponentSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
`;

const ComponentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const ComponentItem = styled.div`
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s ease;
  background: white;
  text-align: center;

  &:hover {
    border-color: #3498db;
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.15);
    transform: translateY(-1px);
  }

  &:active {
    cursor: grabbing;
    transform: translateY(0);
  }
`;

const ComponentIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const ComponentName = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #333;
  line-height: 1.2;
`;

const ComponentDescription = styled.div`
  font-size: 10px;
  color: #666;
  margin-top: 4px;
  line-height: 1.2;
`;

// Component categories based on your existing structure
const COMPONENT_CATEGORIES = [
  {
    id: 'blocks',
    name: 'Blocks',
    sections: [
      {
        title: 'Authentication',
        components: [
          { id: 'LoginForm', name: 'Login Form', icon: '🔐', description: 'User login form' },
          { id: 'SignupForm', name: 'Signup Form', icon: '📝', description: 'User registration' },
          { id: 'ProfileCard', name: 'Profile Card', icon: '👤', description: 'User profile display' },
          { id: 'SocialLoginButtons', name: 'Social Login', icon: '🌐', description: 'OAuth buttons' },
        ]
      },
      {
        title: 'Forms',
        components: [
          { id: 'ContactForm', name: 'Contact Form', icon: '📧', description: 'Contact form' },
          { id: 'SearchForm', name: 'Search Form', icon: '🔍', description: 'Search input' },
          { id: 'FeedbackForm', name: 'Feedback Form', icon: '💬', description: 'User feedback' },
        ]
      },
      {
        title: 'Lists & Data',
        components: [
          { id: 'UserList', name: 'User List', icon: '👥', description: 'List of users' },
          { id: 'ProductGrid', name: 'Product Grid', icon: '🛍️', description: 'Product grid layout' },
          { id: 'ArticleList', name: 'Article List', icon: '📰', description: 'Article listings' },
          { id: 'MessageList', name: 'Message List', icon: '💬', description: 'Chat messages' },
        ]
      },
      {
        title: 'E-commerce',
        components: [
          { id: 'ProductCard', name: 'Product Card', icon: '🏷️', description: 'Product display' },
          { id: 'CartItem', name: 'Cart Item', icon: '🛒', description: 'Shopping cart item' },
          { id: 'CartSummary', name: 'Cart Summary', icon: '🧾', description: 'Order summary' },
        ]
      },
      {
        title: 'Booking',
        components: [
          { id: 'ServiceCard', name: 'Service Card', icon: '🎯', description: 'Service display' },
          { id: 'BookingCalendar', name: 'Booking Calendar', icon: '📅', description: 'Date picker' },
          { id: 'TimeSlotGrid', name: 'Time Slots', icon: '⏰', description: 'Time selection' },
          { id: 'AppointmentCard', name: 'Appointment', icon: '📋', description: 'Appointment info' },
        ]
      },
    ]
  },
  {
    id: 'templates',
    name: 'Templates',
    sections: [
      {
        title: 'Screen Templates',
        components: [
          { id: 'HomeScreen', name: 'Home Screen', icon: '🏠', description: 'Main landing page' },
          { id: 'LoginScreen', name: 'Login Screen', icon: '🔑', description: 'Authentication screen' },
          { id: 'ProfileScreen', name: 'Profile Screen', icon: '👤', description: 'User profile' },
          { id: 'SettingsScreen', name: 'Settings Screen', icon: '⚙️', description: 'App settings' },
        ]
      },
      {
        title: 'E-commerce Templates',
        components: [
          { id: 'ProductListScreen', name: 'Product List', icon: '🛍️', description: 'Product catalog' },
          { id: 'ProductDetailScreen', name: 'Product Detail', icon: '🔍', description: 'Product details' },
          { id: 'CartScreen', name: 'Cart Screen', icon: '🛒', description: 'Shopping cart' },
          { id: 'CheckoutScreen', name: 'Checkout', icon: '💳', description: 'Payment flow' },
        ]
      },
      {
        title: 'Booking Templates',
        components: [
          { id: 'ServicesScreen', name: 'Services', icon: '🎯', description: 'Service listings' },
          { id: 'BookingScreen', name: 'Booking', icon: '📅', description: 'Booking flow' },
          { id: 'MyBookingsScreen', name: 'My Bookings', icon: '📋', description: 'User bookings' },
        ]
      },
    ]
  },
];

interface DraggableComponentProps {
  component: any;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ component }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { 
      type: 'component',
      componentId: component.id,
      componentName: component.name,
      componentType: component.id,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <ComponentItem
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <ComponentIcon>{component.icon}</ComponentIcon>
      <ComponentName>{component.name}</ComponentName>
      <ComponentDescription>{component.description}</ComponentDescription>
    </ComponentItem>
  );
};

const ComponentPalette: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('blocks');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredComponents = useMemo(() => {
    const category = COMPONENT_CATEGORIES.find(cat => cat.id === activeCategory);
    if (!category) return [];

    if (!searchTerm) return category.sections;

    return category.sections
      .map(section => ({
        ...section,
        components: section.components.filter(component =>
          component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          component.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }))
      .filter(section => section.components.length > 0);
  }, [activeCategory, searchTerm]);

  return (
    <PaletteContainer>
      <PaletteHeader>
        <SearchInput
          type="text"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </PaletteHeader>

      <CategoryTabs>
        {COMPONENT_CATEGORIES.map(category => (
          <CategoryTab
            key={category.id}
            $active={activeCategory === category.id}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </CategoryTab>
        ))}
      </CategoryTabs>

      <ComponentList>
        {filteredComponents.map(section => (
          <ComponentSection key={section.title}>
            <SectionTitle>{section.title}</SectionTitle>
            <ComponentGrid>
              {section.components.map(component => (
                <DraggableComponent
                  key={component.id}
                  component={component}
                />
              ))}
            </ComponentGrid>
          </ComponentSection>
        ))}
        
        {filteredComponents.length === 0 && searchTerm && (
          <div style={{ 
            textAlign: 'center', 
            color: '#666', 
            padding: '40px 20px',
            fontSize: '14px'
          }}>
            No components found for "{searchTerm}"
          </div>
        )}
      </ComponentList>
    </PaletteContainer>
  );
};

export default ComponentPalette;
