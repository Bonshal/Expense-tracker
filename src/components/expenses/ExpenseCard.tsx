import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Card, Text, IconButton, Menu } from 'react-native-paper';
import { useSettings } from '../../contexts/SettingsContext';
import { CURRENCIES, Currency } from '../../constants/currencies';

// Define the type for Expense Card props based on DB structure
export interface ExpenseCardProps {
  id: string;
  name: string;
  amount: number;
  category?: string; // Optional
  is_favorite?: boolean; // Optional
  onPress?: () => void; // Optional action on press
  onLongPress?: () => void; // Add onLongPress for dragging
  onToggleFavorite?: (id: string, currentFavorite: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddToToday?: (card: ExpenseCardProps) => void; // Add this prop
  isDragging?: boolean; // Add isDragging prop
  style?: StyleProp<ViewStyle>; // Allow passing custom styles
  currencySymbol?: string; // Add currency symbol prop
}

const ExpenseCard: React.FC<ExpenseCardProps> = (props) => {
  const { currency } = useSettings();
  const currencySymbol = CURRENCIES.find((c: Currency) => c.code === currency)?.symbol || '$';

  const [menuVisible, setMenuVisible] = React.useState(false);

  const handleFavoritePress = () => {
    if (props.onToggleFavorite) {
      props.onToggleFavorite(props.id, props.is_favorite ?? false);
    }
  };

  const handleEdit = () => {
    setMenuVisible(false);
    if (props.onEdit) {
      props.onEdit();
    }
  };

  const handleDelete = () => {
    setMenuVisible(false);
    if (props.onDelete) {
      props.onDelete();
    }
  };

  // Handler for the new "Add to Today" action
  const handleAddToToday = () => {
    setMenuVisible(false);
    if (props.onAddToToday) {
      // Pass the relevant card data back up
      props.onAddToToday({ id: props.id, name: props.name, amount: props.amount, category: props.category, is_favorite: props.is_favorite });
    }
  };

  return (
    <Card 
      style={[styles.card, props.style]} 
      onPress={props.onPress} 
      onLongPress={props.onLongPress} // Pass onLongPress to the Card
      mode="elevated"
      elevation={props.isDragging ? 5 : 2} // Increase elevation when dragging
    >
      <Card.Title
        title={props.name}
        titleNumberOfLines={1}
        subtitle={props.category ? `Cat: ${props.category}` : 'No Category'}
        subtitleNumberOfLines={1}
        // Conditionally render the right prop (Menu) only if NOT dragging
        right={props.isDragging ? undefined : (menuProps) => (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                {...menuProps}
                icon="dots-vertical"
                onPress={() => setMenuVisible(true)}
                size={20}
              />
            }
          >
            <Menu.Item
              onPress={handleAddToToday}
              title="Add to Today"
              leadingIcon="calendar-plus" // Example icon
            />
            <Menu.Item
              onPress={handleEdit}
              title="Edit"
              leadingIcon="pencil"
            />
            <Menu.Item
              onPress={handleDelete}
              title="Delete"
              leadingIcon="delete"
            />
            <Menu.Item
              onPress={handleFavoritePress}
              title={props.is_favorite ? "Remove from Favorites" : "Add to Favorites"}
              leadingIcon={props.is_favorite ? "star-off" : "star"}
            />
          </Menu>
        )}
      />
      <Card.Content>
        <Text style={styles.amountText}>{currencySymbol}{props.amount.toFixed(2)}</Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    marginHorizontal: 5,
    borderRadius: 12, // Add rounded corners
    elevation: 3, // Subtle shadow for depth
    backgroundColor: '#FFFFFF', // Ensure consistent background color
    padding: 10, // Add padding for better spacing
  },
  amountText: {
    fontSize: 18, // Slightly larger font size for better readability
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
    color: '#4CAF50', // Match the primary theme color
  },
});

export default ExpenseCard;