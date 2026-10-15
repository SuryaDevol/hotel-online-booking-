import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchAndFilters from './SearchAndFilters';
import Pagination from './Pagination';

describe('SearchAndFilters Component', () => {
  const defaultProps = {
    searchQuery: '',
    onSearchChange: vi.fn(),
    selectedLocation: 'all',
    onLocationChange: vi.fn(),
    availableLocations: ['Paris, France', 'Tokyo, Japan', 'New York, USA'],
    sortBy: 'default',
    onSortChange: vi.fn(),
    itemsPerPage: 6,
    onItemsPerPageChange: vi.fn(),
    viewMode: 'grid',
    onViewModeChange: vi.fn(),
    onResetFilters: vi.fn(),
    totalResults: 10,
  };

  it('triggers onSearchChange when user types in search box', () => {
    const handleSearchChange = vi.fn();
    render(<SearchAndFilters {...defaultProps} onSearchChange={handleSearchChange} />);

    const searchInput = screen.getByPlaceholderText(/Search hotels by name or location/i);
    fireEvent.change(searchInput, { target: { value: 'tokyo' } });

    expect(handleSearchChange).toHaveBeenCalledWith('tokyo');
  });

  it('triggers onLocationChange when dropdown selection changes', () => {
    const handleLocationChange = vi.fn();
    render(<SearchAndFilters {...defaultProps} onLocationChange={handleLocationChange} />);

    const locationSelect = screen.getByLabelText(/Location:/i);
    fireEvent.change(locationSelect, { target: { value: 'Paris, France' } });

    expect(handleLocationChange).toHaveBeenCalledWith('Paris, France');
  });

  it('triggers onSortChange when sort select changes', () => {
    const handleSortChange = vi.fn();
    render(<SearchAndFilters {...defaultProps} onSortChange={handleSortChange} />);

    const sortSelect = screen.getByLabelText(/Sort By:/i);
    fireEvent.change(sortSelect, { target: { value: 'price-asc' } });

    expect(handleSortChange).toHaveBeenCalledWith('price-asc');
  });

  it('toggles view mode between grid and table', () => {
    const handleViewModeChange = vi.fn();
    render(<SearchAndFilters {...defaultProps} onViewModeChange={handleViewModeChange} />);

    const tableBtn = screen.getByLabelText(/Data Table View/i);
    fireEvent.click(tableBtn);

    expect(handleViewModeChange).toHaveBeenCalledWith('table');
  });
});

describe('Pagination Component', () => {
  it('does not render when totalPages is 1 or less', () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        onPageChange={vi.fn()}
        totalItems={5}
        itemsPerPage={6}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('disables previous button on first page and enables next button', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        onPageChange={vi.fn()}
        totalItems={15}
        itemsPerPage={6}
      />
    );

    const prevBtn = screen.getByRole('button', { name: /Previous page/i });
    const nextBtn = screen.getByRole('button', { name: /Next page/i });

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeEnabled();
  });

  it('calls onPageChange with correct page number when next is clicked', () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        onPageChange={handlePageChange}
        totalItems={15}
        itemsPerPage={6}
      />
    );

    const nextBtn = screen.getByRole('button', { name: /Next page/i });
    fireEvent.click(nextBtn);

    expect(handlePageChange).toHaveBeenCalledWith(2);
  });
});
